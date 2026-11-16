"use client";

import { useActionState } from "react";
import { addExclusion, addParticipant, createDraw, performDraw } from "@/app/actions/draws";
import { SubmitButton } from "@/components/submit-button";
import { showToast } from "@/components/toaster";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { useEffect } from "react";

function useToastOnSuccess(state: ActionState) {
  useEffect(() => {
    if (state.ok && state.message && state.nonce) showToast(state.message);
  }, [state.nonce, state.ok, state.message]);
}

export function DrawCreateForm() {
  const [state, action] = useActionState(createDraw, initialActionState);
  return (
    <form action={action} className="stack">
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      <div>
        <label className="label" htmlFor="draw-title">Naam</label>
        <input id="draw-title" className="input" name="title" required maxLength={80} placeholder="Sinterklaas met de familie" />
      </div>
      <div>
        <label className="label" htmlFor="draw-date">Datum <span className="font-medium text-muted">(optioneel)</span></label>
        <input id="draw-date" className="input" type="date" name="eventDate" />
      </div>
      <div>
        <label className="label" htmlFor="draw-budget">Budget per cadeau <span className="font-medium text-muted">(optioneel)</span></label>
        <input id="draw-budget" className="input" name="budget" inputMode="decimal" placeholder="15" />
      </div>
      <SubmitButton>Trekking maken</SubmitButton>
    </form>
  );
}

export function AddParticipantForm({ drawId }: { drawId: string }) {
  const [state, action] = useActionState(addParticipant, initialActionState);
  useToastOnSuccess(state);
  return (
    <form action={action} className="stack">
      <input type="hidden" name="drawId" value={drawId} />
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      <div>
        <label className="label" htmlFor="participant-name">Naam</label>
        <input id="participant-name" className="input" name="name" required maxLength={60} />
      </div>
      <div>
        <label className="label" htmlFor="participant-email">E-mail <span className="font-medium text-muted">(optioneel)</span></label>
        <input id="participant-email" className="input" name="email" type="email" />
        <p className="hint">Alleen een geheugensteuntje voor jou. We sturen geen mail.</p>
      </div>
      <SubmitButton>Deelnemer toevoegen</SubmitButton>
    </form>
  );
}

export function ExclusionForm({
  drawId,
  participants,
}: {
  drawId: string;
  participants: { id: string; name: string }[];
}) {
  const [state, action] = useActionState(addExclusion, initialActionState);
  useToastOnSuccess(state);
  if (participants.length < 2) return null;
  return (
    <form action={action} className="stack">
      <input type="hidden" name="drawId" value={drawId} />
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      <p className="font-bold">Niet aan elkaar</p>
      <p className="hint">Bijvoorbeeld partners. Zij trekken elkaar niet.</p>
      <label className="label" htmlFor="ex-a">Eerste persoon</label>
      <select id="ex-a" className="select" name="aId" defaultValue={participants[0]?.id}>
        {participants.map((person) => (
          <option key={person.id} value={person.id}>{person.name}</option>
        ))}
      </select>
      <label className="label" htmlFor="ex-b">Tweede persoon</label>
      <select id="ex-b" className="select" name="bId" defaultValue={participants[1]?.id}>
        {participants.map((person) => (
          <option key={person.id} value={person.id}>{person.name}</option>
        ))}
      </select>
      <SubmitButton className="btn-secondary w-full">Uitzondering toevoegen</SubmitButton>
    </form>
  );
}

export function DrawButton({ drawId }: { drawId: string }) {
  const [state, action] = useActionState(performDraw, initialActionState);
  useToastOnSuccess(state);
  return (
    <form action={action} className="stack">
      <input type="hidden" name="drawId" value={drawId} />
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      <SubmitButton>Trek de lootjes</SubmitButton>
    </form>
  );
}
