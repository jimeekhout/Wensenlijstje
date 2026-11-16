import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth-forms";
import { getCurrentUser, safeNextPath } from "@/lib/auth";

export const metadata = { title: "Account maken" };

export default async function SignupPage({
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
      <SignupForm next={next} />
    </div>
  );
}
