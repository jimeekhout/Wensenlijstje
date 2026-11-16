"use client";

import { useState } from "react";

export function DangerConfirm({
  action,
  label,
  confirmLabel,
  hidden,
}: {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  confirmLabel: string;
  hidden?: React.ReactNode;
}) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button className="btn-danger" type="button" onClick={() => setArmed(true)}>
        {label}
      </button>
    );
  }
  return (
    <form action={action} className="stack">
      {hidden}
      <p className="hint">Dit kan niet ongedaan worden.</p>
      <div className="flex flex-wrap gap-2">
        <button className="btn-danger" type="submit">
          {confirmLabel}
        </button>
        <button className="btn-ghost" type="button" onClick={() => setArmed(false)}>
          Annuleren
        </button>
      </div>
    </form>
  );
}
