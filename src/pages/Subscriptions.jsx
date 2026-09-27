import products from '../data';
import { isSubscription, money, unitCents } from '../cartState';
export default function Subscriptions({ onAdd, notice }) {
  return <main className="page shop-page"><div className="shop-container">
    <p className="eyebrow">Make it your StreamList</p><h1>Subscriptions & accessories</h1>
    <p>Choose one subscription, then add your favorite EZTech accessories.</p>
    <p role={notice.warning ? 'alert' : 'status'} className={notice.warning ? 'cart-warning' : 'status-message'}>{notice.text}</p>
    {[true, false].map((subscription) => <section key={String(subscription)}>
      <h2>{subscription ? 'Choose your subscription' : 'EZTech accessories'}</h2>
      <div className="product-grid">{products.filter((p) => isSubscription(p) === subscription).map((product) =>
        <article className="product-card" key={product.id}><img src={product.img} alt="" loading="lazy" />
          <div className="product-details"><h3>{product.service}</h3><p>{product.serviceInfo}</p><strong>{money(unitCents(product))}</strong>
            <button onClick={() => onAdd(product)} aria-label={`Add ${product.service} to cart`}>Add to cart</button>
          </div></article>)}</div>
    </section>)}
  </div></main>;
}
