"use client";

import { useActionState, useState } from "react";
import { createList, updateList } from "@/app/actions/lists";
import { OccasionIcon } from "@/components/occasion-icon";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";
import { OCCASIONS } from "@/lib/occasions";

type Initial = {
  title: string;
  occasion: string;
  occasionCustom: string;
  eventDate: string;
  hasPassword?: boolean;
};

export function ListForm({
  mode,
  listId,
  initial,
  ideaId,
  ideaName,
}: {
  mode: "create" | "edit";
  listId?: string;
  initial?: Initial;
  ideaId?: string;
  ideaName?: string;
}) {
  const action = mode === "create" ? createList : updateList;
  const [state, formAction] = useActionState(action, initialActionState);
  const [occasion, setOccasion] = useState(initial?.occasion ?? "");
  const [usePassword, setUsePassword] = useState(Boolean(initial?.hasPassword));

  return (
    <form action={formAction} className="stack">
      {listId ? <input type="hidden" name="listId" value={listId} /> : null}
      {ideaId ? <input type="hidden" name="ideaId" value={ideaId} /> : null}
      {ideaName ? (
        <p className="note">Na het opslaan zetten we „{ideaName}” op dit lijstje.</p>
      ) : null}
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="notice" role="status">
          {state.message}
        </p>
      ) : null}

      <div>
        <label className="label" htmlFor="list-title">
          Naam van het lijstje
        </label>
        <input
          id="list-title"
          className="input"
          name="title"
          required
          maxLength={80}
          defaultValue={initial?.title ?? ""}
          placeholder="Bijvoorbeeld: Sinterklaas voor Noor"
          autoComplete="off"
          onInput={(event) => event.currentTarget.setCustomValidity("")}
          onInvalid={(event) => event.currentTarget.setCustomValidity("Geef het lijstje een naam.")}
        />
      </div>

      <fieldset className="stack">
        <legend className="label">Gelegenheid</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OCCASIONS.map((item) => (
            <label key={item.id} className={`choice occasion-${item.id}`}>
              <input
                type="radio"
                name="occasion"
                value={item.id}
                checked={occasion === item.id}
                onChange={() => setOccasion(item.id)}
                required
              />
              <span className="occasion-icon h-10 w-10">
                <OccasionIcon name={item.id} className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-bold">{item.label}</span>
                <span className="block text-xs opacity-75">{item.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {occasion === "anders" ? (
        <div>
          <label className="label" htmlFor="occasion-custom">
            Welke gelegenheid?
          </label>
          <input
            id="occasion-custom"
            className="input"
            name="occasionCustom"
            required
            maxLength={40}
            defaultValue={initial?.occasionCustom ?? ""}
            placeholder="Bijvoorbeeld: housewarming"
          />
        </div>
      ) : (
        <input type="hidden" name="occasionCustom" value="" />
      )}

      <div>
        <label className="label" htmlFor="event-date">
          Datum <span className="font-medium text-muted">(optioneel)</span>
        </label>
        <input
          id="event-date"
          className="input"
          type="date"
          name="eventDate"
          defaultValue={initial?.eventDate ?? ""}
        />
        <p className="hint">Bijvoorbeeld de dag van het feest. De datum komt op het lijstje en op de deelpagina.</p>
      </div>

      <fieldset className="stack">
        <label className="flex min-h-12 items-center gap-3 font-bold">
          <input
            type="checkbox"
            name="usePassword"
            checked={usePassword}
            onChange={(event) => setUsePassword(event.target.checked)}
          />
          Alleen zichtbaar met een wachtwoord
        </label>
        {usePassword ? (
          <div>
            <label className="label" htmlFor="list-password">
              {initial?.hasPassword ? "Nieuw wachtwoord" : "Wachtwoord"}
            </label>
            <input
              id="list-password"
              className="input"
              name="listPassword"
              type="password"
              minLength={4}
              maxLength={80}
              autoComplete="new-password"
              required={!initial?.hasPassword}
              placeholder={initial?.hasPassword ? "Laat leeg om het huidige te houden" : "Minimaal 4 tekens"}
            />
          </div>
        ) : initial?.hasPassword ? (
          <input type="hidden" name="removePassword" value="on" />
        ) : null}
      </fieldset>

      <SubmitButton>{mode === "create" ? "Lijstje maken" : "Wijzigingen opslaan"}</SubmitButton>
    </form>
  );
}
