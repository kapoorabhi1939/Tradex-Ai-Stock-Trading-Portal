import assert from "node:assert/strict";
const base = process.env.TRADEX_BASE_URL || "http://127.0.0.1:3000";
for (const path of ["/", "/login", "/icon.svg"]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 200, `${path} should be available`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  console.log(`PASS ${path}: 200, security header present`);
}
for (const path of [
  "/dashboard",
  "/research",
  "/research/NVDA",
  "/research/INVALID",
  "/portfolio",
  "/alerts",
  "/settings",
]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(
    response.status,
    307,
    `${path} must reject an unauthenticated request`,
  );
  assert.equal(
    new URL(response.headers.get("location"), base).pathname,
    "/login",
  );
  console.log(`PASS ${path}: redirects to login without a session`);
}
for (const path of ["/not-a-route", "/orders", "/positions"]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 404, `${path} should not exist in the MVP`);
  console.log(`PASS ${path}: 404`);
}
