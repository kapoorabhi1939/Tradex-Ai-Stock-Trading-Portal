import type { ReactNode } from "react";
import { Panel, SectionTitle } from "./ui";

export function AdminMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Panel className="admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </Panel>
  );
}

export function AdminTable({
  label,
  headings,
  children,
}: {
  label: string;
  headings: readonly string[];
  children: ReactNode;
}) {
  return (
    <div className="admin-table-scroll">
      <table className="admin-table" aria-label={label}>
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function AdminBarChart({
  title,
  sub,
  values,
  valueLabel,
}: {
  title: string;
  sub: string;
  values: readonly { label: string; value: number }[];
  valueLabel: (value: number) => string;
}) {
  const maximum = Math.max(...values.map((item) => item.value));
  return (
    <Panel className="admin-chart-panel">
      <SectionTitle title={title} sub={sub} />
      <div className="admin-bars" role="img" aria-label={`${title}: ${sub}`}>
        {values.map((item) => (
          <div className="admin-bar-column" key={item.label}>
            <span>{valueLabel(item.value)}</span>
            <div className="admin-bar-track">
              <i
                style={{
                  height: `${Math.round((item.value / maximum) * 100)}%`,
                }}
              />
            </div>
            <small>{item.label}</small>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function AdminStatus({ children }: { children: ReactNode }) {
  return <span className="admin-status">{children}</span>;
}
