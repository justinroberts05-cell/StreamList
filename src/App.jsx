import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { STREAM_LIST_KEY, normalizeItems } from "./streamListState";

import Navigation from "./components/Navigation";
import StreamList from "./pages/StreamList";
import Movies from "./pages/Movies";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Login from './pages/Login';
import CreditCard from './pages/CreditCard';
import { readUserData } from './userStorage';

import "./App.css";
import "./shop.css";
import Subscriptions from './pages/Subscriptions';
import { CART_KEY, normalizeCart, addProduct, changeQuantity } from './cartState';

function System({ user, onLogout }) {
  const [cart, setCart] = useState(() => {
    try { return normalizeCart(JSON.parse(readUserData(CART_KEY,user.sub) || '[]')); }
    catch { return []; }
  });
  const [notice, setNotice] = useState({ text: '', warning: false });
  const [storageError, setStorageError] = useState('');
  function updateCart(nextCart) {
    setCart(nextCart);
    try { localStorage.setItem(`${CART_KEY}:${user.sub}`, JSON.stringify(nextCart)); setStorageError(''); }
    catch { setStorageError('Your browser could not save the cart. Changes may be lost when you refresh.'); }
  }
  function handleAdd(product) {
    const result = addProduct(cart, product);
    updateCart(result.cart);
    setNotice({ text: result.warning || `${product.service} added to cart.`, warning: Boolean(result.warning) });
  }
  const [streamState, setStreamState] = useState(() => {
    try {
      return { items: normalizeItems(JSON.parse(readUserData(STREAM_LIST_KEY,user.sub) || '[]')), error: '' };
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
      localStorage.setItem(`${STREAM_LIST_KEY}:${user.sub}`, JSON.stringify(items));
      // Storage synchronization reports browser failures to the UI.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreamState((current) => current.error ? { ...current, error: '' } : current);
    } catch {
      setStreamState((current) => ({ ...current, error: 'Your browser could not save the StreamList. Changes may be lost when you refresh.' }));
    }
  }, [items,user.sub]);

  return (
    <>
      <Navigation cartCount={cart.reduce((sum, row) => sum + row.quantity, 0)} />
      <div className="account-bar"><span>Signed in as {user.name}</span><button onClick={onLogout}>Sign out</button></div>
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
        <Route path="/checkout" element={<CreditCard user={user} cart={cart} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App(){
 const [user,setUser]=useState(null);const [ready,setReady]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{let active=true;async function check(){try{const response=await fetch('/api/session');if(!response.ok)throw new Error();const data=await response.json();if(active){setUser(data.user);setReady(true);}}catch{if(active){setUser(null);setReady(true);}}}check();const timer=setInterval(check,30000);return()=>{active=false;clearInterval(timer);};},[]);
 async function logout(){try{const response=await fetch('/api/logout',{method:'POST'});if(!response.ok)throw new Error();setUser(null);setError('');}catch{setError('Sign out could not reach the server. Reconnect and try again.');}}
 if(!ready)return <main className="page"><p role="status">Checking your sign-in…</p></main>;
 if(!user)return <Routes><Route path="/login" element={<Login onLogin={setUser} />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>;
 return <>{error&&<p role="alert" className="cart-warning">{error}</p>}<System key={user.sub} user={user} onLogout={logout}/></>;
}

export default App;
