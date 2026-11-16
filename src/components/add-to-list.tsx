"use client";

import { useActionState } from "react";
import Link from "next/link";
import { addIdeaToList } from "@/app/actions/ideas";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

export function AddToList({
  ideaId,
  lists,
}: {
  ideaId: string;
  lists: { id: string; title: string }[] | null;
}) {
  const [state, action] = useActionState(addIdeaToList, initialActionState);

  if (lists === null) {
    return (
      <Link className="btn w-full" href={`/inloggen?next=${encodeURIComponent("/cadeauzoeker")}`}>
        Toevoegen aan mijn lijstje
      </Link>
    );
  }

  if (lists.length === 0) {
    return (
      <Link className="btn w-full" href={`/lijsten/nieuw?idee=${encodeURIComponent(ideaId)}`}>
        Toevoegen aan mijn lijstje
      </Link>
    );
  }

  if (state.ok && state.listId) {
    return (
      <p className="notice" role="status">
        {state.message}{" "}
        <Link className="underline" href={`/lijsten/${state.listId}`}>
          Bekijk lijstje
        </Link>
      </p>
    );
  }

  return (
    <form action={action} className="stack">
      <input type="hidden" name="ideaId" value={ideaId} />
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="label" htmlFor={`list-${ideaId}`}>
        Zet op lijstje
      </label>
      <select id={`list-${ideaId}`} className="select" name="listId" defaultValue={lists[0]?.id}>
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.title}
          </option>
        ))}
      </select>
      <SubmitButton>Toevoegen aan mijn lijstje</SubmitButton>
    </form>
  );
}
