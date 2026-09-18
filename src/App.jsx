import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";
import StreamList from "./pages/StreamList";
import Movies from "./pages/Movies";
import Cart from "./pages/Cart";
import About from "./pages/About";

import "./App.css";

function App() {
  const [items, setItems] = useState([]);
  return (
    <>
      <Navigation />

      <Routes>
        <Route path="/" element={<StreamList items={items} setItems={setItems} />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

export default App;
