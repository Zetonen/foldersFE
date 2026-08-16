/** `1` → `"1 item"`, `80` → `"80 items"`. */
export const formatItemCount = (count: number): string =>
  `${count} ${count === 1 ? 'item' : 'items'}`
