import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser, safeNextPath } from "@/lib/auth";

export const metadata = { title: "Inloggen" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const user = await getCurrentUser();
  if (user) redirect(next);
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <LoginForm next={next} />
    </div>
  );
}
