import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const navLinkClass = ({ isActive }) =>
  `nav-link-custom${isActive ? " nav-link-active" : ""}`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <nav className="topbar">
      <div className="container topbar-inner">
        <Link className="brand-mark" to="/">
          <span className="brand-badge">F</span>
          <span>
            <strong>FAISHORA</strong>
            <small>Premium Fashion Store</small>
          </span>
        </Link>

        <div className="nav-actions">
          <NavLink className={navLinkClass} to="/">
            Home
          </NavLink>
          <NavLink className={navLinkClass} to="/categories">
            Categories
          </NavLink>
          <NavLink className={navLinkClass} to="/wishlist">
            Wishlist ({wishlistCount})
          </NavLink>
          <NavLink className={navLinkClass} to="/cart">
            Cart ({cartCount})
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink className={navLinkClass} to="/orders">
                My Orders
              </NavLink>
              <NavLink className={navLinkClass} to="/account">
                Account
              </NavLink>
            </>
          ) : null}
          {user?.role === "admin" ? (
            <NavLink className={navLinkClass} to="/admin/catalog">
              Admin
            </NavLink>
          ) : null}
          {isAuthenticated ? (
            <>
              <span className="auth-user-chip">{user?.name || user?.email}</span>
              <button className="nav-signout-button" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className={navLinkClass} to="/login">
                Login
              </NavLink>
              <NavLink className={navLinkClass} to="/register">
                Register
              </NavLink>
              <NavLink className={navLinkClass} to="/admin/login">
                Admin Login
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
