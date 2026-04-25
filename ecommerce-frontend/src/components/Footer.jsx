import React from "react";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <p className="footer-logo">FAISHORA Store</p>
            <p className="footer-copy">
              Fashion-focused ecommerce built for clean browsing, fast checkout,
              and a polished customer experience.
            </p>
          </div>
          <div>
            <p className="footer-heading">Shopping</p>
            <p className="footer-link">Mens</p>
            <p className="footer-link">Womens</p>
            <p className="footer-link">Kids</p>
          </div>
          <div>
            <p className="footer-heading">Support</p>
            <p className="footer-link">Orders</p>
            <p className="footer-link">Returns</p>
            <p className="footer-link">Help Center</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
