"use client";

import { useEffect, useState } from "react";

import { createAlert, getAlerts } from "../lib/api";
import type { AlertRule } from "../lib/types";

const initialForm = {
  ticker: "MSFT",
  condition_type: "price_above" as const,
  threshold: 450,
  delivery_channel: "email" as const,
  enabled: true
};

export function AlertsClient() {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    async function hydrate() {
      const response = await getAlerts();
      setAlerts(response.items);
    }

    hydrate();
  }, []);

  async function submit() {
    const response = await createAlert(form);
    setAlerts(response.items);
  }

  return (
    <div className="section-stack">
      <div className="panel">
        <h2>Create alert</h2>
        <p>Configure price or signal-based notifications that can later be delivered by email or in-app messaging.</p>
        <div className="field-grid two">
          <label>
            Ticker
            <input value={form.ticker} onChange={(event) => setForm({ ...form, ticker: event.target.value.toUpperCase() })} />
          </label>
          <label>
            Condition
            <select
              value={form.condition_type}
              onChange={(event) => setForm({ ...form, condition_type: event.target.value as typeof form.condition_type })}
            >
              <option value="price_above">Price above</option>
              <option value="price_below">Price below</option>
              <option value="signal_change">Signal change</option>
            </select>
          </label>
          <label>
            Threshold
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.threshold}
              onChange={(event) => setForm({ ...form, threshold: Number(event.target.value) })}
            />
          </label>
          <label>
            Delivery channel
            <select
              value={form.delivery_channel}
              onChange={(event) => setForm({ ...form, delivery_channel: event.target.value as typeof form.delivery_channel })}
            >
              <option value="email">Email</option>
              <option value="in_app">In app</option>
            </select>
          </label>
        </div>
        <div className="cta-row" style={{ marginTop: 18 }}>
          <button className="primary" onClick={submit}>
            Save alert
          </button>
        </div>
      </div>

      <div className="table-card">
        <h2>Active alerts</h2>
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Condition</th>
              <th>Threshold</th>
              <th>Channel</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.alert_id}>
                <td>{alert.ticker}</td>
                <td>{alert.condition_type.replaceAll("_", " ")}</td>
                <td>{alert.threshold}</td>
                <td>{alert.delivery_channel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

