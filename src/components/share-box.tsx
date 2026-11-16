"use client";

import { useEffect, useState } from "react";
import { ShareQr } from "@/components/share-qr";
import { showToast } from "@/components/toaster";

export function ShareBox({ url, title }: { url: string; title: string }) {
  const [canShare, setCanShare] = useState(false);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    `Hoi! Hier is mijn wensenlijstje “${title}”. Kijk rustig rond en streep af wat jij koopt: ${url}`,
  )}`;

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link gekopieerd.");
    } catch {
      showToast("Selecteer de link en kopieer hem zelf.");
    }
  }

  async function share() {
    try {
      await navigator.share({ title, text: "Mijn wensenlijstje op hetwensenlijstje.nl", url });
    } catch {
      // The visitor closed the share sheet.
    }
  }

  return (
    <div className="card stack p-4">
      <div>
        <label className="label" htmlFor="deellink">
          Deellink
        </label>
        <p className="hint">Iedereen met deze link kan het lijstje bekijken, zonder account.</p>
      </div>
      <input
        id="deellink"
        className="input text-sm"
        readOnly
        value={url}
        data-testid="share-url"
        onFocus={(event) => event.currentTarget.select()}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button className="btn" type="button" onClick={copy}>
          Kopieer link
        </button>
        <a className="btn-secondary" href={whatsapp} target="_blank" rel="noopener noreferrer">
          Delen via WhatsApp
        </a>
        {canShare ? (
          <button className="btn-ghost col-span-2" type="button" onClick={share}>
            Deel via je telefoon…
          </button>
        ) : null}
      </div>
      <ShareQr url={url} />
    </div>
  );
}
