import { NavLink } from "react-router-dom";

function Navigation() {
  return (
    <nav className="navbar">
      <div className="logo">StreamList</div>

      <div className="nav-links">
        <NavLink to="/">StreamList</NavLink>
        <NavLink to="/movies">Movies</NavLink>
        <NavLink to="/cart">Cart</NavLink>
        <NavLink to="/about">About</NavLink>
      </div>
    </nav>
  );
}

export default Navigation;