import products from './data.js';
export const CART_KEY = 'streamListCart';
export const isSubscription = (product) => /subscription/i.test(product.service);
export const money = (cents) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const unitCents = (product) => Math.round(product.price * 100);
export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const result = [];
  for (const row of value) {
    const product = products.find((p) => p.id === row?.id);
    if (!product || !Number.isSafeInteger(row.quantity) || row.quantity < 1 || result.some((r) => r.id === row.id)) continue;
    if (isSubscription(product) && result.some((r) => isSubscription(products.find((p) => p.id === r.id)))) continue;
    result.push({ id: row.id, quantity: isSubscription(product) ? 1 : Math.min(row.quantity, product.amount) });
  }
  return result;
}
export function addProduct(cart, product) {
  if (isSubscription(product) && cart.some((row) => isSubscription(products.find((p) => p.id === row.id)))) return { cart, warning: 'Only one subscription can be in your cart. Remove your current subscription before adding another.' };
  const existing = cart.find((row) => row.id === product.id);
  if (existing?.quantity >= product.amount) return { cart, warning: 'You have reached the available quantity for this item.' };
  return { cart: existing ? cart.map((row) => row.id === product.id ? { ...row, quantity: row.quantity + 1 } : row) : [...cart, { id: product.id, quantity: 1 }], warning: '' };
}
export function changeQuantity(cart, id, quantity) {
  const product = products.find((p) => p.id === id);
  if (!product || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > product.amount || (isSubscription(product) && quantity !== 1)) return cart;
  return cart.map((row) => row.id === id ? { ...row, quantity } : row);
}
