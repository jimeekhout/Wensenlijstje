"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function ShareQr({ url }: { url: string }) {
  const [image, setImage] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(url, { margin: 1, width: 280, color: { dark: "#2a2118", light: "#fffdf9" } })
      .then((value) => {
        if (active) setImage(value);
      })
      .catch(() => {
        if (active) setImage("");
      });
    return () => {
      active = false;
    };
  }, [url]);

  if (!image) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="QR-code van de deellink" className="h-28 w-28 rounded-xl" />
      <div className="stack">
        <p className="font-bold">QR-code</p>
        <p className="hint">Laat iemand de code scannen om het lijstje te openen.</p>
        <a className="btn-secondary min-h-11 px-3" href={image} download="hetwensenlijstje-qr.png">
          Download QR
        </a>
      </div>
    </div>
  );
}
