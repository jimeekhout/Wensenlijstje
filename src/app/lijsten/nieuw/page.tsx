import { ListForm } from "@/components/list-form";
import { getGiftIdea } from "@/data/gift-ideas";

export const metadata = { title: "Nieuw lijstje" };

export default async function NewListPage({
  searchParams,
}: {
  searchParams: Promise<{ idee?: string }>;
}) {
  const params = await searchParams;
  const idea = params.idee ? getGiftIdea(params.idee) : null;
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <h1 className="mb-4 text-4xl">Nieuw lijstje</h1>
      <div className="card p-4">
        <ListForm mode="create" ideaId={idea?.id} ideaName={idea?.name} />
      </div>
    </div>
  );
}
