import { headers } from "next/headers";
import { configuredAppUrl } from "@/lib/env";

export async function requestOrigin() {
  const configured = configuredAppUrl();
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
