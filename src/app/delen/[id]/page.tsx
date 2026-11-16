import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ShareView } from "@/components/ShareView";
import { Shell } from "@/components/SiteChrome";
import { OWNER_COOKIE, VISITOR_COOKIE, parseOwnerIds } from "@/lib/cookies";
import { getPublicWishlist } from "@/lib/wishlists";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const list = getPublicWishlist(id, { includeReservations: false, visitorId: null });
  return { title: list?.title ?? "Lijstje niet gevonden" };
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jar = await cookies();
  const ownerView = parseOwnerIds(jar.get(OWNER_COOKIE)?.value).includes(id);
  const visitorId = jar.get(VISITOR_COOKIE)?.value ?? null;
  const list = getPublicWishlist(id, {
    includeReservations: !ownerView,
    visitorId,
  });
  if (!list) notFound();

  return (
    <Shell>
      <ShareView initialList={list} />
    </Shell>
  );
}
