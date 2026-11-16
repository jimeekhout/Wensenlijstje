"use client";

import { useState } from "react";

export function RemoteImage({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // User-supplied product images can come from any shop, so next/image's host allowlist does not fit.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-44 w-full object-cover"
      referrerPolicy="no-referrer"
      onError={() => setOk(false)}
    />
  );
}
