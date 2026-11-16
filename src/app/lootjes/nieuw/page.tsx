import { redirect } from "next/navigation";
import { DrawCreateForm } from "@/components/draw-forms";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Nieuwe trekking" };

export default async function NewDrawPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen?next=/lootjes/nieuw");
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <h1 className="mb-4 text-4xl">Nieuwe trekking</h1>
      <div className="card p-4">
        <DrawCreateForm />
      </div>
    </div>
  );
}
