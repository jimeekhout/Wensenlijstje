export type ActionState = {
  error?: string;
  ok?: boolean;
  message?: string;
  nonce?: string;
  listTitle?: string;
  listId?: string;
};

export const initialActionState: ActionState = {};
