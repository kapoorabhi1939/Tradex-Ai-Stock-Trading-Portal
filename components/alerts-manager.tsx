"use client";
import { useState } from "react";
import { Bell, Plus, Play, Pause, Trash2, Clock3, Pencil } from "lucide-react";
import {
  conditions,
  type AlertRule,
  type TriggeredAlert,
} from "@/lib/alerts/model";
import {
  createAlert,
  updateAlert,
  deleteAlert,
  toggleAlert,
  evaluateAlerts,
} from "@/app/actions/workspace";
import { ActionForm } from "./action-form";
import { TickerSelect } from "./ticker-select";
import { Panel, SectionTitle, Stat, EmptyState } from "./ui";
export function AlertsManager({
  rules,
  activity,
}: {
  rules: AlertRule[];
  activity: TriggeredAlert[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = rules.find((rule) => rule.id === editingId) ?? null;
  const [condition, setCondition] = useState("price_above");
  return (
    <>
      <div className="research-summary alert-summary">
        <Stat
          label="Enabled rules"
          value={rules.filter((r) => r.enabled).length}
          detail="Ready for manual evaluation"
        />
        <Stat
          label="Paused rules"
          value={rules.filter((r) => !r.enabled).length}
          detail="Excluded from evaluations"
        />
        <Stat
          label="Recent triggers"
          value={activity.length}
          detail="Latest 50 recorded matches"
        />
        <div className="evaluate-block">
          <ActionForm
            action={evaluateAlerts}
            label={
              <>
                <Play size={15} /> Evaluate alerts
              </>
            }
            pendingLabel="Evaluating…"
          />
          <small>Runs once, only when you click.</small>
        </div>
      </div>
      <div className="alerts-layout">
        <div className="stack">
          <Panel>
            <SectionTitle
              title={
                editing ? `Edit ${editing.ticker} rule` : "Create an alert rule"
              }
              sub="Choose the condition that matters to your research."
            />
            <ActionForm
              key={editing?.id ?? "new"}
              action={editing ? updateAlert : createAlert}
              className="alert-form"
              label={
                <>
                  <Plus size={16} />{" "}
                  {editing ? "Save rule changes" : "Create rule"}
                </>
              }
            >
              {editing ? (
                <>
                  <input type="hidden" name="id" value={editing.id} />
                  <input type="hidden" name="ticker" value={editing.ticker} />
                  <p>
                    Equity: <strong>{editing.ticker}</strong>
                  </p>
                </>
              ) : (
                <TickerSelect />
              )}
              <label>
                Condition
                <select
                  name="condition_type"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  {Object.entries(conditions).map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {!condition.startsWith("signal_") && (
                <label>
                  Threshold {condition.startsWith("price") ? "(USD)" : "(%)"}
                  <input
                    key={condition}
                    defaultValue={editing?.threshold ?? undefined}
                    name="threshold"
                    type="number"
                    required
                    min="0"
                    max={condition.startsWith("confidence") ? 100 : 1000000}
                    step="0.01"
                    placeholder={
                      condition.startsWith("price") ? "e.g. 200" : "e.g. 70"
                    }
                  />
                </label>
              )}
            </ActionForm>
          </Panel>
          <Panel>
            <SectionTitle
              title="Your rules"
              sub={`${rules.length} saved rules`}
            />
            {!rules.length ? (
              <EmptyState title="Keep important conditions in view">
                Create a price, confidence, or directional signal rule, then
                evaluate it against the latest available market data.
              </EmptyState>
            ) : (
              <div className="rule-list">
                {rules.map((rule) => (
                  <div className="rule-row" key={rule.id}>
                    <span className="rule-icon">
                      <Bell size={19} />
                    </span>
                    <div className="rule-description">
                      <strong>{rule.ticker}</strong>
                      <p>
                        {conditions[rule.condition_type]}
                        {rule.threshold === null
                          ? ""
                          : ` ${rule.condition_type.startsWith("price") ? "$" : ""}${rule.threshold}${rule.condition_type.startsWith("confidence") ? "%" : ""}`}
                      </p>
                      <span
                        className={`rule-status ${rule.enabled ? "positive" : "muted"}`}
                      >
                        {rule.enabled ? "● Enabled" : "Ⅱ Paused"}
                      </span>
                    </div>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        aria-label={`Edit ${rule.ticker} rule`}
                        onClick={() => {
                          setEditingId(rule.id);
                          setCondition(rule.condition_type);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <ActionForm
                        action={toggleAlert}
                        label={
                          rule.enabled ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )
                        }
                        accessibleLabel={`${rule.enabled ? "Pause" : "Enable"} ${rule.ticker} rule`}
                        pendingLabel="…"
                        buttonClass="icon-button"
                      >
                        <input type="hidden" name="id" value={rule.id} />
                        <input
                          type="hidden"
                          name="enabled"
                          value={String(!rule.enabled)}
                        />
                      </ActionForm>
                      <ActionForm
                        action={deleteAlert}
                        label={<Trash2 size={16} />}
                        accessibleLabel={`Delete ${rule.ticker} rule`}
                        pendingLabel="…"
                        buttonClass="icon-button danger"
                        confirmMessage="Delete this rule and its associated history?"
                      >
                        <input type="hidden" name="id" value={rule.id} />
                      </ActionForm>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <div className="stack">
          <Panel>
            <SectionTitle
              title="Triggered history"
              sub="Saved evaluation results · UTC"
            />
            {!activity.length ? (
              <EmptyState title="A quiet moment">
                Matches appear here after you evaluate your rules. Try a
                price-above threshold below an equity’s displayed market price.
              </EmptyState>
            ) : (
              <div className="timeline">
                {activity.map((item) => (
                  <article key={item.id}>
                    <span className="timeline-dot" />
                    <small>
                      {new Date(item.triggered_at).toLocaleString("en-US", {
                        timeZone: "UTC",
                      })}{" "}
                      UTC
                    </small>
                    <h3>
                      {item.ticker} ·{" "}
                      {item.message.includes("Demo price")
                        ? "Archived evaluation"
                        : "Condition matched"}
                    </h3>
                    <p>
                      {item.message.includes("Demo price")
                        ? "Recorded before the current market-data connection."
                        : item.message}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </Panel>
          <div className="evaluation-note">
            <Clock3 size={21} />
            <div>
              <h3>Deliberately on your schedule.</h3>
              <p>
                Alerts are evaluated manually. No background monitoring, email,
                or push notifications run.
              </p>
              <p>
                Rules record at most one match per market-data day. Repeated
                evaluations, edits and pause/resume do not create duplicate
                history. Stale or unavailable inputs are skipped.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
