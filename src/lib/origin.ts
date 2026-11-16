import { headers } from "next/headers";

export async function requestOrigin() {
  const configured = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const headerList = await headers();
  const host = (headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000")
    .split(",")[0]
    .trim();
  const proto = (headerList.get("x-forwarded-proto") ?? "http").split(",")[0].trim();
  if ((proto !== "http" && proto !== "https") || !/^[\w.:-]+$/.test(host) || host.includes("..")) {
    return "http://localhost:3000";
  }
  return `${proto}://${host}`;
}
