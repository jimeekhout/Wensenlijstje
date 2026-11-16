"use client";

import { useEffect, useState, useTransition } from "react";
import { clearReservationAction, reserveItemAction } from "@/lib/actions";
import { cadeauLabel, formatPrice, reservedSummary, siteName } from "@/lib/format";
import type { PublicItem, PublicWishlist, ReservationStatus } from "@/lib/types";
import { parseReservation } from "@/lib/validate";
import { GiftImage } from "./GiftImage";

function statusText(item: PublicItem): string {
  const reservation = item.reservation;
  if (!reservation) return "";
  const verb = reservation.status === "gekocht" ? "Gekocht" : "Gereserveerd";
  if (reservation.mine && reservation.name) return `${verb} door jou (${reservation.name})`;
  if (reservation.mine) return `${verb} door jou`;
  if (reservation.name) return `${verb} door ${reservation.name}`;
  return reservation.status === "gekocht" ? "Iemand heeft dit al gekocht" : "Iemand heeft dit gereserveerd";
}

export function ShareView({ initialList }: { initialList: PublicWishlist }) {
  const [list, setList] = useState(initialList);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    setList((current) => (current.revision > initialList.revision ? current : initialList));
  }, [initialList]);

  const reserved = list.items.filter((item) => item.reservation).length;

  function reserve(itemId: string, status: ReservationStatus, name: string) {
    const parsed = parseReservation({ status, name });
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    startTransition(async () => {
      const result = await reserveItemAction(list.id, itemId, { status, name });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setList(result.data);
      setError(null);
    });
  }

  function clear(itemId: string) {
    startTransition(async () => {
      const result = await clearReservationAction(list.id, itemId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setList(result.data);
      setError(null);
    });
  }

  return (
    <div data-ready={ready ? "ja" : "nee"}>
      <p className="kicker">{list.occasion ?? "Wensenlijstje"}</p>
      <section className="panel">
        <h1>{list.title}</h1>
        {list.description ? <p>{list.description}</p> : null}
        {list.ownerView ? (
          <p className="banner">
            <strong>Je bekijkt je eigen deellink.</strong>
            Reserveringen blijven ook hier verborgen. Familie en vrienden zien ze wel.
          </p>
        ) : (
          <>
            <p>
              Kies een cadeau en reserveer het, of geef aan dat je het al hebt gekocht. De ontvanger ziet niet wat je doet.
            </p>
            <p className="muted">
              {cadeauLabel(list.items.length)}. {reservedSummary(reserved, list.items.length)}
            </p>
          </>
        )}
      </section>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      {list.items.length === 0 ? (
        <div className="empty panel">
          <h2>Nog geen cadeaus</h2>
          <p>Er staat nog niets op dit lijstje.</p>
        </div>
      ) : (
        <div className="stack">
          {list.items.map((item) => (
            <article
              className={`item-card ${item.priority ?? ""} ${item.reservation ? "is-taken" : ""}`}
              key={item.id}
            >
              <GiftImage src={item.imageUrl} />
              <div className="item-body">
                <div className="item-top">
                  <h2>{item.name}</h2>
                  {item.priceCents != null ? <p className="price">{formatPrice(item.priceCents)}</p> : null}
                </div>
                <div className="badges">
                  {item.priority ? <span className={`badge ${item.priority}`}>Prioriteit: {item.priority}</span> : null}
                  {!item.reservation && !list.ownerView ? <span className="badge">Nog beschikbaar</span> : null}
                </div>
                {item.note ? <p className="note">{item.note}</p> : null}
                {item.url ? (
                  <p>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      Bekijk bij {siteName(item.url)}
                    </a>
                  </p>
                ) : null}
                {list.ownerView ? null : item.reservation && !item.reservation.mine ? (
                  <p className={`status-banner ${item.reservation.status}`}>{statusText(item)}</p>
                ) : (
                  <ReserveControls
                    item={item}
                    pending={pending}
                    onReserve={(status, name) => reserve(item.id, status, name)}
                    onClear={() => clear(item.id)}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ReserveControls({
  item,
  pending,
  onReserve,
  onClear,
}: {
  item: PublicItem;
  pending: boolean;
  onReserve: (status: ReservationStatus, name: string) => void;
  onClear: () => void;
}) {
  const [name, setName] = useState(item.reservation?.name ?? "");

  useEffect(() => {
    setName(item.reservation?.name ?? "");
  }, [item.reservation?.name, item.reservation?.status]);

  return (
    <div>
      {item.reservation ? <p className={`status-banner ${item.reservation.status}`}>{statusText(item)}</p> : null}
      <label className="field" htmlFor={`naam-${item.id}`}>
        <span>Jouw naam (optioneel)</span>
        <input
          id={`naam-${item.id}`}
          className="text-input"
          type="text"
          maxLength={80}
          autoComplete="name"
          value={name}
          placeholder="Bijvoorbeeld: oma"
          onChange={(event) => setName(event.target.value)}
        />
        <span className="hint">Andere gasten zien je naam. De ontvanger niet.</span>
      </label>
      <div className="button-row">
        <button
          className="button primary"
          type="button"
          disabled={pending}
          onClick={() => onReserve("gereserveerd", name)}
        >
          {item.reservation?.status === "gereserveerd" ? "Reservering bijwerken" : "Reserveren"}
        </button>
        <button className="button ghost" type="button" disabled={pending} onClick={() => onReserve("gekocht", name)}>
          {item.reservation?.status === "gekocht" ? "Bijwerken" : "Ik heb dit gekocht"}
        </button>
        {item.reservation?.mine ? (
          <button className="button danger" type="button" disabled={pending} onClick={onClear}>
            Reservering intrekken
          </button>
        ) : null}
      </div>
    </div>
  );
}
