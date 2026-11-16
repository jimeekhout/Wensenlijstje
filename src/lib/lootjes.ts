export type Pair = { a: string; b: string };

/** A derangement that also respects mutual exclusions. Returns null when no fair draw exists. */
export function drawAssignments(ids: string[], exclusions: Pair[] = []): Record<string, string> | null {
  const unique = [...new Set(ids)];
  if (unique.length < 2 || unique.length !== ids.length) return null;

  const blocked = new Map<string, Set<string>>(unique.map((id) => [id, new Set([id])]));
  for (const pair of exclusions) {
    if (!blocked.has(pair.a) || !blocked.has(pair.b) || pair.a === pair.b) continue;
    blocked.get(pair.a)?.add(pair.b);
    blocked.get(pair.b)?.add(pair.a);
  }

  const assignment: Record<string, string> = {};
  const used = new Set<string>();

  function visit(index: number): boolean {
    if (index === unique.length) return true;
    const giver = unique[index];
    const options = unique.filter((id) => !used.has(id) && !blocked.get(giver)?.has(id));
    for (let i = options.length - 1; i > 0; i -= 1) {
      const swap = Math.floor(Math.random() * (i + 1));
      [options[i], options[swap]] = [options[swap], options[i]];
    }
    for (const option of options) {
      used.add(option);
      assignment[giver] = option;
      if (visit(index + 1)) return true;
      used.delete(option);
      delete assignment[giver];
    }
    return false;
  }

  return visit(0) ? assignment : null;
}

export function shareTokenFromInput(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/\/delen\/([A-Za-z0-9_-]+)/);
  if (match) return match[1];
  if (/^[A-Za-z0-9_-]{16,80}$/.test(trimmed)) return trimmed;
  return null;
}

export function canRedraw(input: { drawnAt: Date | null; viewedCount: number }) {
  return Boolean(input.drawnAt) && input.viewedCount === 0;
}

/** Organiser payloads must not carry who drew whom. */
export function hideAssignments<T extends { drawsParticipantId?: string | null }>(participants: T[]) {
  return participants.map((participant) => {
    const rest = { ...participant };
    delete rest.drawsParticipantId;
    return rest;
  });
}
