import { Link } from 'react-router-dom';
import products from '../data';
import { isSubscription, money, unitCents } from '../cartState';
export default function Cart({ cart, onQuantity, onRemove }) {
  const count = cart.reduce((sum, row) => sum + row.quantity, 0);
  const total = cart.reduce((sum, row) => sum + unitCents(products.find((p) => p.id === row.id)) * row.quantity, 0);
  return <main className="page shop-page"><div className="shop-container">
    <p className="eyebrow">Your selections</p><h1>Shopping cart</h1>
    {cart.length === 0 ? <section className="cart-empty"><h2>Your cart is empty</h2><p>Find a subscription or an accessory to get started.</p><Link to="/subscriptions">Browse subscriptions & accessories</Link></section> : <>
      <p>{count} {count === 1 ? 'item' : 'items'} in your cart</p>
      <ul className="cart-rows">{cart.map((row) => {
        const product = products.find((p) => p.id === row.id);
        return <li className="cart-row" key={row.id}>
          <div className="cart-product"><h2>{product.service}</h2><p>{money(unitCents(product))} each</p></div>
          {isSubscription(product) ? <p>Quantity: 1<br /><small>One subscription per cart</small></p> : <div className="quantity-controls">
            <button aria-label={`Decrease ${product.service} quantity`} disabled={row.quantity === 1} onClick={() => onQuantity(row.id, row.quantity - 1)}>−</button>
            <label>Quantity<input type="number" min="1" max={product.amount} step="1" value={row.quantity} aria-label={`${product.service} quantity`} onChange={(e) => onQuantity(row.id, e.target.valueAsNumber)} /></label>
            <button aria-label={`Increase ${product.service} quantity`} disabled={row.quantity >= product.amount} onClick={() => onQuantity(row.id, row.quantity + 1)}>+</button>
          </div>}
          <strong>{money(unitCents(product) * row.quantity)}</strong>
          <button className="remove-item" onClick={() => onRemove(row.id)} aria-label={`Remove ${product.service}`}>Remove</button>
        </li>;
      })}</ul>
      <div className="cart-total" aria-live="polite"><span>Total</span><strong>{money(total)}</strong></div>
      <Link to="/subscriptions">Continue shopping</Link>
    </>}
  </div></main>;
}
