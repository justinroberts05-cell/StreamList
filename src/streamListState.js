export const STREAM_LIST_KEY = 'streamListItems';

// Validate browser data before components depend on its shape.
export function normalizeItems(value) {
  if (!Array.isArray(value)) return [];
  const ids = new Set();
  return value.filter((item) => {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id) ||
        typeof item.title !== 'string' || !item.title.trim() ||
        typeof item.completed !== 'boolean') return false;
    ids.add(item.id);
    return true;
  });
}
