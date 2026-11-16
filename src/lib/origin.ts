export function requestOrigin(headerList: { get(name: string): string | null }): string {
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = (headerList.get("x-forwarded-proto") ?? "http").split(",")[0]?.trim() || "http";
  return `${proto}://${host}`;
}
