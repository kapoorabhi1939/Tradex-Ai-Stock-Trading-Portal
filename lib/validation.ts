import { getEquity } from "./demo-market";
import { conditions, type Condition } from "./alerts";
export function textField(form: FormData, name: string, max = 100) {
  const value = form.get(name);
  if (typeof value !== "string" || value.length > max)
    throw new Error(`Invalid ${name.replaceAll("_", " ")}.`);
  return value.trim();
}
export function tickerField(form: FormData) {
  const ticker = textField(form, "ticker", 10).toUpperCase();
  if (!getEquity(ticker)) throw new Error("Select a supported equity.");
  return ticker;
}
export function numberField(
  form: FormData,
  name: string,
  min: number,
  max: number,
) {
  const raw = textField(form, name, 30);
  const value = Number(raw);
  if (!raw || !Number.isFinite(value) || value < min || value > max)
    throw new Error(
      `${name.replaceAll("_", " ")} must be between ${min} and ${max}.`,
    );
  return value;
}
export function idField(form: FormData) {
  const id = textField(form, "id", 36);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    throw new Error("Invalid record.");
  return id;
}
export function alertFields(form: FormData) {
  const ticker = tickerField(form);
  const condition = textField(form, "condition_type", 30);
  if (!Object.hasOwn(conditions, condition))
    throw new Error("Select a supported alert condition.");
  const threshold = condition.startsWith("signal_")
    ? null
    : numberField(
        form,
        "threshold",
        0,
        condition.startsWith("confidence_") ? 100 : 1000000,
      );
  return { ticker, condition_type: condition as Condition, threshold };
}
export function safeDestination(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^\/(dashboard|research|portfolio|alerts|settings)(\/|\?|$)/.test(value) ||
    /[\\\r\n]/.test(value)
  )
    return "/dashboard";
  return value;
}
