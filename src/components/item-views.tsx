import { ClaimForm, UnclaimForm } from "@/components/claim-controls";
import { DeleteItemButton } from "@/components/delete-item-button";
import { ItemForm } from "@/components/item-form";
import { RemoteImage } from "@/components/remote-image";
import { priorityLabel } from "@/lib/format";
import { formatEuro, formatPriceInput } from "@/lib/price";
import type { VisibleClaim } from "@/lib/viewer-items";
import { applyAffiliate } from "@/lib/affiliate";
import { shopLabel } from "@/lib/urls";

export type ItemFields = {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  priceCents: number | null;
  imageUrl: string | null;
  priority: number | null;
};

function ItemBody({ item, reserved }: { item: ItemFields; reserved?: boolean }) {
  const label = priorityLabel(item.priority);
  const href = item.url ? applyAffiliate(item.url) : null;
  return (
    <>
      {item.imageUrl ? <RemoteImage src={item.imageUrl} alt="" /> : null}
      <div className="stack p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className={`text-2xl break-words ${reserved ? "line-through decoration-clay/70" : ""}`}>{item.name}</h2>
          {label ? <span className={`priority priority-${item.priority}`}>{label}</span> : null}
        </div>
        {item.description ? <p className="whitespace-pre-wrap text-[0.98rem] leading-relaxed">{item.description}</p> : null}
        {item.priceCents != null ? <p className="text-lg font-extrabold">{formatEuro(item.priceCents)}</p> : null}
        {href ? (
          <a className="font-bold text-clay underline decoration-clay/40 underline-offset-4" href={href} target="_blank" rel="noopener noreferrer sponsored">
            {shopLabel(href)}
          </a>
        ) : null}
      </div>
    </>
  );
}

export function OwnerItem({ item, listId }: { item: ItemFields; listId: string }) {
  return (
    <article className="card overflow-hidden" data-testid="owner-item">
      <ItemBody item={item} />
      <div className="stack px-4 pb-4">
        <details>
          <summary>Bewerken</summary>
          <div className="pt-3">
            <ItemForm
              mode="edit"
              listId={listId}
              initial={{
                id: item.id,
                name: item.name,
                description: item.description ?? "",
                url: item.url ?? "",
                price: item.priceCents != null ? formatPriceInput(item.priceCents) : "",
                imageUrl: item.imageUrl ?? "",
                priority: item.priority ? String(item.priority) : "",
              }}
            />
          </div>
        </details>
        <DeleteItemButton itemId={item.id} />
      </div>
    </article>
  );
}

export function PublicItem({
  item,
  readOnly = false,
}: {
  item: ItemFields & { claim: VisibleClaim | null };
  readOnly?: boolean;
}) {
  const reserved = Boolean(item.claim && !item.claim.claimedByYou);
  return (
    <article className="card overflow-hidden" data-testid="public-item">
      <ItemBody item={item} reserved={reserved} />
      {readOnly ? null : (
        <div className="px-4 pb-4">
          {item.claim?.claimedByYou ? (
            <UnclaimForm itemId={item.id} />
          ) : item.claim ? (
            <p className="claim-stamp" data-testid="claim-badge">
              Gereserveerd door {item.claim.claimerName}
            </p>
          ) : (
            <ClaimForm itemId={item.id} />
          )}
        </div>
      )}
    </article>
  );
}
