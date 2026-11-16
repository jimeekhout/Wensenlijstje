export async function register() {
  if (process.env.VERCEL !== "1") return;
  const { authSecret, configuredAppUrl } = await import("@/lib/env");
  authSecret();
  configuredAppUrl();
}
