"use client";

import { useState } from "react";

export function GiftImage({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img className="gift-image" src={src} alt="" onError={() => setFailed(true)} />;
}
