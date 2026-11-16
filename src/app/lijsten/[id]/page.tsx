import { notFound } from "next/navigation";
import { deleteList } from "@/app/actions/lists";
import { DangerConfirm } from "@/components/danger-confirm";
import { ItemForm } from "@/components/item-form";
import { OwnerItem } from "@/components/item-views";
import { ListForm } from "@/components/list-form";
import { OccasionBanner } from "@/components/occasion-banner";
import { ShareBox } from "@/components/share-box";
import { getCurrentUser } from "@/lib/auth";
import { cadeauCount, formatDutchDate, toDateInputValue } from "@/lib/format";
import { requestOrigin } from "@/lib/origin";
import { getOwnedList } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return { title: "Lijstje" };
  const list = await getOwnedList(user.id, id);
  return { title: list?.title ?? "Lijstje" };
}

export default async function OwnerListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const list = await getOwnedList(user.id, id);
  if (!list) notFound();
  const origin = await requestOrigin();
  const detail = [list.eventDate ? formatDutchDate(list.eventDate) : null, cadeauCount(list.items.length)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6" data-testid="owner-list">
      <OccasionBanner occasion={list.occasion} custom={list.occasionCustom} title={list.title} detail={detail} />
      <ShareBox url={`${origin}/delen/${list.shareToken}`} title={list.title} />
      <aside className="note">
        <p className="font-extrabold">Dit blijft een verrassing.</p>
        <p className="mt-1">
          Bezoekers kunnen een cadeau afstrepen, zodat niet twee mensen hetzelfde kopen. Jij ziet die afstrepingen niet, zolang je bent ingelogd.
        </p>
      </aside>
      {list.items.length === 0 ? (
        <p className="hint">Nog geen cadeaus. Voeg er hieronder een toe.</p>
      ) : (
        <ul className="stack">
          {list.items.map((item) => (
            <li key={item.id}>
              <OwnerItem item={item} listId={list.id} />
            </li>
          ))}
        </ul>
      )}
      <details className="card p-4" {...(list.items.length === 0 ? { open: true } : {})}>
        <summary>Cadeau toevoegen</summary>
        <div className="pt-3">
          <ItemForm mode="create" listId={list.id} />
        </div>
      </details>
      <details className="card p-4">
        <summary>Lijstje aanpassen</summary>
        <div className="stack pt-3">
          <ListForm
            mode="edit"
            listId={list.id}
            initial={{
              title: list.title,
              occasion: list.occasion,
              occasionCustom: list.occasionCustom ?? "",
              eventDate: toDateInputValue(list.eventDate),
            }}
          />
          <DangerConfirm
            action={deleteList}
            label="Lijstje verwijderen"
            confirmLabel="Ja, verwijder dit lijstje"
            hidden={<input type="hidden" name="listId" value={list.id} />}
          />
        </div>
      </details>
    </div>
  );
}
