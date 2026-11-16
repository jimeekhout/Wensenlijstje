import { secretMatches } from "@/lib/hash";

export type ClaimRecord = {
  itemId: string;
  claimerName: string;
  secretHash: string;
};

export type VisibleClaim = {
  claimerName: string;
  claimedByYou: boolean;
};

/**
 * Owners always receive items without claim data, even if claim rows are passed in.
 * Visitors receive the claimer's name, never the secret hash.
 */
export function buildViewerItems<T extends { id: string }>(
  items: T[],
  claims: ClaimRecord[],
  options: {
    hideClaims: boolean;
    secretsByItemId: Record<string, string | undefined>;
  },
): Array<T & { claim: VisibleClaim | null }> {
  if (options.hideClaims) {
    return items.map((item) => ({ ...item, claim: null }));
  }

  const byId = new Map(claims.map((claim) => [claim.itemId, claim]));
  return items.map((item) => {
    const claim = byId.get(item.id);
    if (!claim) return { ...item, claim: null };
    const secret = options.secretsByItemId[item.id];
    return {
      ...item,
      claim: {
        claimerName: claim.claimerName,
        claimedByYou: Boolean(secret && secretMatches(secret, claim.secretHash)),
      },
    };
  });
}
