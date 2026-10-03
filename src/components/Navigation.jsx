import { NavLink } from "react-router-dom";

function Navigation({ cartCount = 0 }) {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="logo">StreamList</div>

      <div className="nav-links">
        <NavLink to="/" end>StreamList</NavLink>
        <NavLink to="/movies">Movies</NavLink>
        <NavLink to="/subscriptions">Subscriptions</NavLink>
        <NavLink to="/cart">Cart <span className="cart-badge" aria-label={`${cartCount} items in cart`}>{cartCount}</span></NavLink>
        <NavLink to="/about">About</NavLink>
      </div>
    </nav>
  );
}

export default Navigation;
