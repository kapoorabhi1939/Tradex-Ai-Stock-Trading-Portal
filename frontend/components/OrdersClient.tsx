"use client";

import { useEffect, useState } from "react";

import { estimateOrder, getInstrumentMeta, getOrderTypes, getOrders, getQuote } from "../lib/api";
import type { InstrumentMeta, MarketQuote, OrderEstimate, OrderRecord, OrderType } from "../lib/types";

function orderStatusClass(status: OrderRecord["status"]) {
  if (status === "FILLED") {
    return "status-positive";
  }
  if (status === "PARTIAL" || status === "PENDING" || status === "SUBMITTED") {
    return "status-warning";
  }
  if (status === "REJECTED" || status === "CANCELLED" || status === "EXPIRED") {
    return "status-danger";
  }
  return "status-neutral";
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function OrdersClient() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>(["MARKET", "LIMIT"]);
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [meta, setMeta] = useState<InstrumentMeta | null>(null);
  const [estimate, setEstimate] = useState<OrderEstimate | null>(null);
  const [form, setForm] = useState<{
    ticker: string;
    quantity: number;
    order_type: OrderType;
    limit_price: number;
  }>({
    ticker: "AAPL",
    quantity: 25,
    order_type: "LIMIT",
    limit_price: 199.65
  });

  async function hydrateInstrument(ticker: string) {
    const symbol = ticker.toUpperCase();
    const [quoteResponse, metaResponse] = await Promise.all([getQuote(symbol), getInstrumentMeta(symbol)]);
    setQuote(quoteResponse);
    setMeta(metaResponse);
  }

  useEffect(() => {
    async function hydrate() {
      const [ordersResponse, orderTypeResponse] = await Promise.all([getOrders(), getOrderTypes()]);
      setOrders(ordersResponse.orders);
      setOrderTypes(orderTypeResponse.items);
      await hydrateInstrument(form.ticker);
      const estimateResponse = await estimateOrder(form);
      setEstimate(estimateResponse);
    }

    hydrate();
  }, []);

  async function recalculateEstimate() {
    await hydrateInstrument(form.ticker);
    const estimateResponse = await estimateOrder(form);
    setEstimate(estimateResponse);
  }

  return (
    <div className="section-stack">
      <div className="grid-2">
        <div className="panel">
          <h2>Order entry widget</h2>
          <p>The registry required server-driven order type enums, limit-price suggestions, and explicit fee estimates.</p>
          <div className="field-grid two">
            <label>
              Instrument ticker
              <input
                value={form.ticker}
                onChange={(event) => setForm({ ...form, ticker: event.target.value.toUpperCase() })}
              />
            </label>
            <label>
              Order type
              <select
                value={form.order_type}
                onChange={(event) => setForm({ ...form, order_type: event.target.value as OrderType })}
              >
                {orderTypes.map((orderType) => (
                  <option key={orderType} value={orderType}>
                    {orderType}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                min="1"
                step="1"
                type="number"
                value={form.quantity}
                onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
              />
            </label>
            <label>
              Limit price
              <input
                min="0"
                step="0.01"
                type="number"
                value={form.limit_price}
                onChange={(event) => setForm({ ...form, limit_price: Number(event.target.value) })}
              />
            </label>
          </div>

          <div className="cta-row" style={{ marginTop: 18 }}>
            <button className="primary" onClick={recalculateEstimate} type="button">
              Refresh estimate
            </button>
          </div>

          {quote ? (
            <div className="status-inline" style={{ marginTop: 18 }}>
              <span className="label-chip">Bid {quote.bid.toFixed(2)}</span>
              <span className="label-chip">Ask {quote.ask.toFixed(2)}</span>
              <span className="label-chip">Mark {quote.mark_price.toFixed(2)}</span>
            </div>
          ) : null}

          {meta?.restricted ? (
            <div className="compliance-banner banner-critical" style={{ marginTop: 18 }}>
              <div>
                <strong>Trading restriction</strong>
                <p>{meta.restriction_reason}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="panel">
          <h2>Pre-submit estimate</h2>
          {estimate ? (
            <div className="field-grid">
              <div className="metric">
                <span>Limit suggestion</span>
                <strong>{estimate.limit_price_suggestion.toFixed(2)}</strong>
              </div>
              <div className="metric">
                <span>Estimated fees</span>
                <strong>{currency(estimate.estimated_total)}</strong>
              </div>
              <p className="muted">{estimate.freshness.message}</p>
              <ul className="inline-list">
                {Object.entries(estimate.breakdown).map(([label, value]) => (
                  <li className="pill" key={label}>
                    {label.replaceAll("_", " ")}: {currency(value)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="table-card">
        <h2>Order lifecycle states</h2>
        <p>
          The registry explicitly called for distinct visual states across Draft, Pending, Submitted, Partial, Filled,
          Cancelled, Rejected, and Expired.
        </p>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Ticker</th>
              <th>Type</th>
              <th>Status</th>
              <th>Filled Qty</th>
              <th>Limit</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{order.ticker}</td>
                <td>{order.order_type}</td>
                <td>
                  <span className={`status-chip ${orderStatusClass(order.status)}`}>{order.status}</span>
                  {order.needs_reconcile ? <span className="reconcile-badge">Reconcile</span> : null}
                </td>
                <td>
                  {order.filled_quantity}/{order.total_quantity}
                </td>
                <td>{order.limit_price ? order.limit_price.toFixed(2) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
