import { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { STREAM_LIST_KEY, normalizeItems } from "./streamListState";

import Navigation from "./components/Navigation";
import StreamList from "./pages/StreamList";
import Movies from "./pages/Movies";
import Cart from "./pages/Cart";
import About from "./pages/About";

import "./App.css";
import "./shop.css";
import Subscriptions from './pages/Subscriptions';
import { CART_KEY, normalizeCart, addProduct, changeQuantity } from './cartState';

function App() {
  const [cart, setCart] = useState(() => {
    try { return normalizeCart(JSON.parse(localStorage.getItem(CART_KEY) || '[]')); }
    catch { return []; }
  });
  const [notice, setNotice] = useState({ text: '', warning: false });
  const [storageError, setStorageError] = useState('');
  function updateCart(nextCart) {
    setCart(nextCart);
    try { localStorage.setItem(CART_KEY, JSON.stringify(nextCart)); setStorageError(''); }
    catch { setStorageError('Your browser could not save the cart. Changes may be lost when you refresh.'); }
  }
  function handleAdd(product) {
    const result = addProduct(cart, product);
    updateCart(result.cart);
    setNotice({ text: result.warning || `${product.service} added to cart.`, warning: Boolean(result.warning) });
  }
  const [streamState, setStreamState] = useState(() => {
    try {
      return { items: normalizeItems(JSON.parse(localStorage.getItem(STREAM_LIST_KEY) || '[]')), error: '' };
    } catch {
      return { items: [], error: 'Your saved StreamList could not be loaded. You can still use the list during this visit.' };
    }
  });
  const { items, error: streamStorageError } = streamState;

  const listChanged = useRef(false);

  function setItems(update) {
    listChanged.current = true;
    setStreamState((current) => ({ ...current, items: update(current.items) }));
  }

  useEffect(() => {
    if (!listChanged.current) return;
    try {
      localStorage.setItem(STREAM_LIST_KEY, JSON.stringify(items));
      // Storage synchronization reports browser failures to the UI.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreamState((current) => current.error ? { ...current, error: '' } : current);
    } catch {
      setStreamState((current) => ({ ...current, error: 'Your browser could not save the StreamList. Changes may be lost when you refresh.' }));
    }
  }, [items]);

  return (
    <>
      <Navigation cartCount={cart.reduce((sum, row) => sum + row.quantity, 0)} />
      {storageError && <p className="cart-warning" role="alert">{storageError}</p>}

      <Routes>
        <Route
          path="/"
          element={<StreamList items={items} setItems={setItems} storageError={streamStorageError} />}
        />
        <Route path="/movies" element={<Movies />} />
        <Route path="/subscriptions" element={<Subscriptions onAdd={handleAdd} notice={notice} />} />
        <Route path="/cart" element={<Cart cart={cart} onQuantity={(id, quantity) => updateCart(changeQuantity(cart, id, quantity))} onRemove={(id) => { updateCart(cart.filter((row) => row.id !== id)); setNotice({ text: '', warning: false }); }} />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

export default App;
