export const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
export const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
export const percent = (n: number) =>
  `${n >= 0 ? "+" : ""}${n.toFixed(n !== 0 && Math.abs(n) < 0.01 ? 5 : 2)}%`;

export function marketMoney(n: number, currency: string, precision?: number) {
  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: precision ?? (n < 1 ? 5 : 2),
  };
  if (/^[A-Z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat("en-US", {
        ...options,
        style: "currency",
        currency,
      }).format(n);
    } catch {}
  }
  return (
    new Intl.NumberFormat("en-US", options).format(n) +
    (currency ? " " + currency : "")
  );
}
