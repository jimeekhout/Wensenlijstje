"use client";

import { showToast } from "@/components/toaster";

export function CopyLink({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex gap-2">
        <input className="input text-sm" readOnly value={value} onFocus={(event) => event.currentTarget.select()} />
        <button
          className="btn min-h-12 shrink-0 px-3"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              showToast("Link gekopieerd.");
            } catch {
              showToast("Selecteer de link en kopieer hem zelf.");
            }
          }}
        >
          Kopieer
        </button>
      </div>
    </div>
  );
}
