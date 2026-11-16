import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { OwnerEditor } from "@/components/OwnerEditor";
import { Shell } from "@/components/SiteChrome";
import { requestOrigin } from "@/lib/origin";
import { getOwnerWishlist } from "@/lib/wishlists";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const list = getOwnerWishlist(token);
  return { title: list?.title ?? "Lijstje niet gevonden" };
}

export default async function OwnerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const list = getOwnerWishlist(token);
  if (!list) notFound();

  const origin = requestOrigin(await headers());
  return (
    <Shell>
      <OwnerEditor
        token={token}
        initialList={list}
        shareUrl={`${origin}/delen/${list.id}`}
        ownerUrl={`${origin}/lijst/${token}`}
      />
    </Shell>
  );
}
