"use client";

import { useState } from "react";

export function CopyField({ label, value, hint }: { label: string; value: string; hint: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="copy-field">
      <span id={`${label}-label`}>{label}</span>
      <div className="copy-row">
        <input
          aria-labelledby={`${label}-label`}
          readOnly
          value={value}
          onFocus={(event) => event.currentTarget.select()}
        />
        <button className="button primary" type="button" onClick={() => void copy()}>
          {copied ? "Gekopieerd" : "Kopieer"}
        </button>
      </div>
      <p className="hint">{hint}</p>
    </div>
  );
}
