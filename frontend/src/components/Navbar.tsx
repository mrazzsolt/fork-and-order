import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const { count } = useCart();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Fork & Order
      </Link>
      <div className="navbar-links">
        <Link to="/">Menu</Link>
        {token ? (
          <>
            <Link to="/orders">My Orders</Link>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        <Link to="/cart" className="cart-btn">
          🛒 <span className="cart-count">{count}</span>
        </Link>
      </div>
    </nav>
  );
}
