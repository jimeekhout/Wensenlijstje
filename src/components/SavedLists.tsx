"use client";

import { useEffect, useState } from "react";
import { loadStoredLists, type StoredList } from "@/lib/stored-lists";

export function SavedLists() {
  const [lists, setLists] = useState<StoredList[] | null>(null);

  useEffect(() => {
    setLists(loadStoredLists());
  }, []);

  return (
    <section className="panel">
      <h2>Op dit apparaat</h2>
      {lists && lists.length === 0 ? (
        <p className="muted">
          Nog geen lijstjes op dit apparaat. Maak er een, of open je beheerlink op deze telefoon of computer.
        </p>
      ) : null}
      {lists?.map((list) => (
        <a className="saved-list" key={list.id} href={`/lijst/${list.ownerToken}`}>
          <span>
            <strong>{list.title}</strong>
            <span className="muted">{list.occasion ?? "Geen gelegenheid"}</span>
          </span>
          <span aria-hidden="true">→</span>
        </a>
      ))}
    </section>
  );
}
