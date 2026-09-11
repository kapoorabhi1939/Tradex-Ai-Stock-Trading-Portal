export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export function validateSignup(
  form: FormData,
): { data: SignupInput; error?: never } | { data?: never; error: string } {
  const rawName = form.get("name");
  const rawEmail = form.get("email");
  const password = form.get("password");
  const confirmation = form.get("confirm_password");
  const terms = form.get("terms");
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

  if (!name || name.length > 60)
    return { error: "Enter a name of 60 characters or fewer." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return { error: "Enter a valid email address." };
  if (typeof password !== "string" || password.length < 8)
    return { error: "Use at least 8 characters for your password." };
  if (password.length > 256) return { error: "Your password is too long." };
  if (confirmation !== password) return { error: "Passwords do not match." };
  if (terms !== "on")
    return { error: "Accept the terms and privacy policy to continue." };

  return { data: { name, email, password } };
}
