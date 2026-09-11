export function accountDestinations(admin: boolean) {
  return [
    { href: "/settings", label: "Account settings" },
    { href: "/pricing", label: "Compare plans" },
    ...(admin ? [{ href: "/admin", label: "Admin Console" }] : []),
  ];
}
