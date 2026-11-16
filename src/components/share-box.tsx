"use client";

import { useEffect, useState } from "react";

export function ShareBox({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
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
      <div className="flex flex-wrap gap-2">
        <button className="btn" type="button" onClick={copy}>
          {copied ? "Gekopieerd" : "Kopieer link"}
        </button>
        {canShare ? (
          <button className="btn-secondary" type="button" onClick={share}>
            Deel…
          </button>
        ) : null}
      </div>
    </div>
  );
}
