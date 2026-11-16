"use client";

import { OCCASION_PRESETS } from "@/lib/occasions";

const CHOICES = ["", ...OCCASION_PRESETS, "Anders"] as const;

function labelFor(choice: string): string {
  return choice === "" ? "Geen" : choice;
}

export function OccasionFields({
  preset,
  custom,
  onPreset,
  onCustom,
}: {
  preset: string;
  custom: string;
  onPreset: (value: string) => void;
  onCustom: (value: string) => void;
}) {
  return (
    <>
      <fieldset className="chips">
        <legend>Gelegenheid</legend>
        {CHOICES.map((choice) => (
          <label className="chip" key={choice || "geen"}>
            <input
              type="radio"
              name="gelegenheid"
              value={choice}
              checked={preset === choice}
              onChange={() => onPreset(choice)}
            />
            {labelFor(choice)}
          </label>
        ))}
      </fieldset>
      {preset === "Anders" ? (
        <label className="field">
          <span>Welke gelegenheid?</span>
          <input
            className="text-input"
            type="text"
            maxLength={40}
            value={custom}
            placeholder="Bijvoorbeeld afstuderen"
            onChange={(event) => onCustom(event.target.value)}
          />
        </label>
      ) : null}
    </>
  );
}
