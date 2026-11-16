export type DeletedItem = {
  listId: string;
  name: string;
  description: string | null;
  url: string | null;
  priceCents: number | null;
  imageUrl: string | null;
  priority: number | null;
};

export type ActionState = {
  error?: string;
  ok?: boolean;
  message?: string;
  nonce?: string;
  listTitle?: string;
  listId?: string;
  deleted?: DeletedItem;
};

export const initialActionState: ActionState = {};
