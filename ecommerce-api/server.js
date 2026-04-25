const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { promiseDb } = require("./db");

const app = express();
const port = Number(process.env.PORT || 5000);
const authSecret = process.env.AUTH_SECRET || "change-this-secret-key";
const tokenExpiresInHours = Number(process.env.TOKEN_EXPIRES_IN_HOURS || 24);
const adminRegistrationCode = process.env.ADMIN_REGISTRATION_CODE || "";
const validOrderStatuses = ["placed", "processing", "shipped", "delivered", "cancelled"];
const validPaymentMethods = ["Cash on Delivery", "UPI", "Credit Card", "Debit Card"];
const deliveryTimelineSteps = ["placed", "processing", "shipped", "delivered"];
const defaultLowStockThreshold = 5;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const escapeSvgText = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderProductImageSvg = ({ slug, title, category, variant }) => {
  const seed = crypto.createHash("md5").update(`${slug}-${variant}`).digest("hex");
  const primary = `#${seed.slice(0, 6)}`;
  const secondary = `#${seed.slice(6, 12)}`;
  const accent = `#${seed.slice(12, 18)}`;
  const safeTitle = escapeSvgText(title).slice(0, 24);
  const safeCategory = escapeSvgText(category).slice(0, 56);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100" role="img" aria-label="${safeTitle}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="55%" stop-color="${secondary}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="900" height="1100" fill="url(#bg)"/>
  <circle cx="738" cy="170" r="138" fill="rgba(255,255,255,0.14)"/>
  <circle cx="148" cy="930" r="188" fill="rgba(255,255,255,0.10)"/>
  <rect x="74" y="78" width="752" height="944" rx="48" fill="rgba(255,248,240,0.16)" stroke="rgba(255,255,255,0.28)"/>
  <text x="110" y="168" fill="rgba(255,248,240,0.82)" font-family="Arial, Helvetica, sans-serif" font-size="30" letter-spacing="8">FAISHORA</text>
  <text x="110" y="856" fill="#fff9f3" font-family="Georgia, serif" font-size="92" font-weight="700">${safeTitle}</text>
  <text x="110" y="912" fill="rgba(255,249,243,0.9)" font-family="Arial, Helvetica, sans-serif" font-size="28">${safeCategory}</text>
  <text x="110" y="964" fill="rgba(255,249,243,0.78)" font-family="Arial, Helvetica, sans-serif" font-size="24">Premium fashion selection</text>
  <path d="M202 320c44-56 116-92 182-92 74 0 138 34 176 92 44 68 34 148-8 228-36 70-88 136-128 204-18 30-66 30-84 0-40-68-92-134-128-204-42-80-52-160-10-228z" fill="rgba(255,248,240,0.92)"/>
  <path d="M296 342c26-34 64-54 110-54 50 0 92 20 118 54 34 44 26 98-6 154-28 48-68 96-98 144-8 14-28 14-36 0-30-48-70-96-98-144-32-56-40-110-10-154z" fill="rgba(255,255,255,0.48)"/>
</svg>`;
};

app.get("/product-images/:slug/:variant.svg", (req, res) => {
  const slug = String(req.params.slug || "product").trim() || "product";
  const variant = String(req.params.variant || "1").trim() || "1";
  const title = String(req.query.title || "FAISHORA").trim() || "FAISHORA";
  const category = String(req.query.category || "Premium fashion").trim() || "Premium fashion";

  res.type("image/svg+xml");
  res.set("Cache-Control", "public, max-age=86400");
  res.send(renderProductImageSvg({ slug, title, category, variant }));
});

const base64UrlEncode = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return Buffer.from(padded, "base64").toString("utf8");
};

const createHash = (value, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.pbkdf2Sync(value, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const verifyHash = (value, storedHash) => {
  const [salt, originalHash] = String(storedHash || "").split(":");
  if (!salt || !originalHash) {
    return false;
  }

  const candidateHash = crypto
    .pbkdf2Sync(value, salt, 100000, 64, "sha512")
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(candidateHash, "hex"),
    Buffer.from(originalHash, "hex")
  );
};

const signToken = (payload) => {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + tokenExpiresInHours * 60 * 60,
    })
  );
  const signature = crypto
    .createHmac("sha256", authSecret)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${header}.${body}.${signature}`;
};

const verifyToken = (token) => {
  const [header, payload, signature] = String(token || "").split(".");
  if (!header || !payload || !signature) {
    throw new Error("Invalid token.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", authSecret)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (expectedSignature !== signature) {
    throw new Error("Invalid token signature.");
  }

  const parsedPayload = JSON.parse(base64UrlDecode(payload));
  if (parsedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired.");
  }

  return parsedPayload;
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const normalizeProductInput = ({ name, price, image, category, description }) => ({
  normalizedName: typeof name === "string" ? name.trim() : "",
  normalizedCategory: typeof category === "string" ? category.trim() : "",
  normalizedImage: typeof image === "string" ? image.trim() : "",
  normalizedDescription: typeof description === "string" ? description.trim() : "",
  numericPrice: Number(price),
});

const formatProduct = (product) => ({
  ...product,
  price: Number(product.price),
});

const normalizeAddressInput = ({ label, fullName, phone, line1, line2, city, state, postalCode, country, isDefault }) => ({
  label: String(label || "").trim() || "Home",
  fullName: String(fullName || "").trim(),
  phone: String(phone || "").trim(),
  line1: String(line1 || "").trim(),
  line2: String(line2 || "").trim(),
  city: String(city || "").trim(),
  state: String(state || "").trim(),
  postalCode: String(postalCode || "").trim(),
  country: String(country || "").trim() || "India",
  isDefault: Boolean(isDefault),
});

const formatAddress = (row) => ({
  id: row.id,
  label: row.label,
  fullName: row.full_name,
  phone: row.phone,
  line1: row.line1,
  line2: row.line2,
  city: row.city,
  state: row.state,
  postalCode: row.postal_code,
  country: row.country,
  isDefault: Boolean(row.is_default),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildShippingAddress = (address) => {
  const segments = [
    address.full_name || address.fullName,
    address.phone,
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code || address.postalCode].filter(Boolean).join(", "),
    address.country,
  ];

  return segments.filter(Boolean).join(", ");
};

const getPaymentStatus = (paymentMethod, paymentStatus, orderStatus) => {
  if (orderStatus === "cancelled") {
    return paymentMethod === "Cash on Delivery" ? "cancelled" : paymentStatus || "refunded";
  }

  if (paymentMethod === "Cash on Delivery") {
    return orderStatus === "delivered" ? "paid" : paymentStatus || "pending";
  }

  return paymentStatus || "paid";
};

const buildStatusTimeline = (order) => {
  if (order.status === "cancelled") {
    return [
      {
        key: "placed",
        label: "Order placed",
        completed: true,
        active: false,
      },
      {
        key: "cancelled",
        label: "Order cancelled",
        completed: true,
        active: true,
      },
    ];
  }

  const activeIndex = deliveryTimelineSteps.indexOf(order.status);

  return deliveryTimelineSteps.map((step, index) => ({
    key: step,
    label: step.charAt(0).toUpperCase() + step.slice(1),
    completed: activeIndex >= index,
    active: order.status === step,
  }));
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const normalizeCartRows = (rows) =>
  rows.map((item) => ({
    cartItemId: item.cartItemId,
    quantity: Number(item.quantity),
    product: formatProduct({
      id: item.id,
      name: item.name,
      image: item.image,
      category: item.category,
      description: item.description,
      price: item.price,
    }),
    lineTotal: Number(item.price) * Number(item.quantity),
  }));

const normalizeWishlistRows = (rows) =>
  rows.map((item) => ({
    wishlistItemId: item.wishlistItemId,
    product: formatProduct({
      id: item.id,
      name: item.name,
      image: item.image,
      category: item.category,
      description: item.description,
      price: item.price,
    }),
  }));

const formatOrderRows = (rows) => {
  const orders = new Map();

  rows.forEach((row) => {
    if (!orders.has(row.orderId)) {
      const paymentStatus = getPaymentStatus(row.payment_method, row.payment_status, row.status);

      orders.set(row.orderId, {
        id: row.orderId,
        status: row.status,
        paymentMethod: row.payment_method,
        paymentStatus,
        paymentReference: row.payment_reference || "",
        shippingAddress: row.shipping_address,
        cancelReason: row.cancel_reason,
        totalAmount: Number(row.total_amount),
        createdAt: row.created_at,
        customer: row.customer_name
          ? {
              id: row.user_id,
              name: row.customer_name,
              email: row.customer_email,
            }
          : null,
        items: [],
      });
    }

    orders.get(row.orderId).items.push({
      id: row.orderItemId,
      productId: row.product_id,
      name: row.name,
      image: row.image,
      category: row.category,
      quantity: Number(row.quantity),
      unitPrice: Number(row.unit_price),
      lineTotal: Number(row.quantity) * Number(row.unit_price),
    });
  });

  return Array.from(orders.values()).map((order) => ({
    ...order,
    statusTimeline: buildStatusTimeline(order),
  }));
};

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication token is required." });
    }

    const payload = verifyToken(token);
    const [rows] = await promiseDb.query(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [payload.sub]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Session is no longer valid." });
    }

    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access is required for this action." });
  }

  next();
};


const initializeDatabase = async () => {
  await promiseDb.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      image TEXT,
      category VARCHAR(190) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await promiseDb.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      security_question VARCHAR(255) NOT NULL,
      security_answer_hash TEXT NOT NULL,
      role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await promiseDb.query(`
    CREATE TABLE IF NOT EXISTS addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      label VARCHAR(80) NOT NULL DEFAULT 'Home',
      full_name VARCHAR(120) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      line1 VARCHAR(255) NOT NULL,
      line2 VARCHAR(255) NULL,
      city VARCHAR(120) NOT NULL,
      state VARCHAR(120) NOT NULL,
      postal_code VARCHAR(40) NOT NULL,
      country VARCHAR(120) NOT NULL DEFAULT 'India',
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await promiseDb.query(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_wishlist_user_product (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await promiseDb.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_product (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await promiseDb.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      shipping_address TEXT NOT NULL,
      payment_method VARCHAR(120) NOT NULL,
      payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',
      payment_reference VARCHAR(190) NULL,
      status ENUM('placed', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'placed',
      cancel_reason TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await promiseDb.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(40) NOT NULL DEFAULT 'pending'");
  await promiseDb.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(190) NULL");

  await promiseDb.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    )
  `);

};

app.get("/api/products", async (req, res) => {
  try {
    const [result] = await promiseDb.query("SELECT * FROM products ORDER BY id DESC");
    res.json({ success: true, totalProducts: result.length, data: result.map(formatProduct) });
  } catch (error) {
    console.error("Failed to fetch products:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch products right now." });
  }
});

app.get("/api/products/:productId", async (req, res) => {
  const productId = Number(req.params.productId);

  try {
    const [rows] = await promiseDb.query("SELECT * FROM products WHERE id = ? LIMIT 1", [productId]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.json({ success: true, product: formatProduct(rows[0]) });
  } catch (error) {
    console.error("Failed to fetch product:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch product details right now." });
  }
});

app.post("/api/products", authMiddleware, requireAdmin, async (req, res) => {
  const { normalizedName, normalizedCategory, normalizedImage, normalizedDescription, numericPrice } =
    normalizeProductInput(req.body);

  if (!normalizedName || !normalizedCategory || Number.isNaN(numericPrice)) {
    return res.status(400).json({ success: false, message: "Name, category and a valid price are required." });
  }

  try {
    const [result] = await promiseDb.query(
      "INSERT INTO products (name, price, image, category, description) VALUES (?, ?, ?, ?, ?)",
      [normalizedName, numericPrice, normalizedImage, normalizedCategory, normalizedDescription]
    );

    res.status(201).json({ success: true, message: "Product added successfully.", insertedId: result.insertId });
  } catch (error) {
    console.error("Failed to add product:", error.message);
    res.status(500).json({ success: false, message: "Failed to add product." });
  }
});

app.put("/api/products/:productId", authMiddleware, requireAdmin, async (req, res) => {
  const productId = Number(req.params.productId);
  const { normalizedName, normalizedCategory, normalizedImage, normalizedDescription, numericPrice } =
    normalizeProductInput(req.body);

  if (!normalizedName || !normalizedCategory || Number.isNaN(numericPrice)) {
    return res.status(400).json({ success: false, message: "Name, category and a valid price are required." });
  }

  try {
    const [result] = await promiseDb.query(
      `UPDATE products
       SET name = ?, price = ?, image = ?, category = ?, description = ?
       WHERE id = ?`,
      [normalizedName, numericPrice, normalizedImage, normalizedCategory, normalizedDescription, productId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.json({ success: true, message: "Product updated successfully." });
  } catch (error) {
    console.error("Failed to update product:", error.message);
    res.status(500).json({ success: false, message: "Unable to update product right now." });
  }
});

app.delete("/api/products/:productId", authMiddleware, requireAdmin, async (req, res) => {
  const productId = Number(req.params.productId);

  try {
    const [result] = await promiseDb.query("DELETE FROM products WHERE id = ?", [productId]);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("Failed to delete product:", error.message);
    res.status(500).json({ success: false, message: "Product cannot be deleted while it is referenced by orders." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, securityQuestion, securityAnswer, adminCode } = req.body;
  const normalizedName = String(name || "").trim();
  const normalizedEmail = normalizeEmail(email);
  const normalizedQuestion = String(securityQuestion || "").trim();
  const normalizedAnswer = String(securityAnswer || "").trim();
  const normalizedPassword = String(password || "");
  const normalizedAdminCode = String(adminCode || "").trim();

  if (!normalizedName || !normalizedEmail || !normalizedPassword || !normalizedQuestion || !normalizedAnswer) {
    return res.status(400).json({ success: false, message: "All registration fields are required." });
  }

  try {
    const [existingUsers] = await promiseDb.query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
    if (existingUsers.length) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const role = adminRegistrationCode && normalizedAdminCode === adminRegistrationCode ? "admin" : "customer";
    const passwordHash = createHash(normalizedPassword);
    const securityAnswerHash = createHash(normalizedAnswer.toLowerCase());

    const [result] = await promiseDb.query(
      `INSERT INTO users (name, email, password_hash, security_question, security_answer_hash, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [normalizedName, normalizedEmail, passwordHash, normalizedQuestion, securityAnswerHash, role]
    );

    const user = { id: result.insertId, name: normalizedName, email: normalizedEmail, role };
    const token = signToken({ sub: user.id, role: user.role, email: user.email });

    res.status(201).json({ success: true, message: "Account created successfully.", token, user });
  } catch (error) {
    console.error("Failed to register user:", error.message);
    res.status(500).json({ success: false, message: "Unable to register right now." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.email);
  const normalizedPassword = String(req.body.password || "");

  if (!normalizedEmail || !normalizedPassword) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    const [rows] = await promiseDb.query("SELECT * FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
    if (!rows.length || !verifyHash(normalizedPassword, rows[0].password_hash)) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user = sanitizeUser(rows[0]);
    const token = signToken({ sub: user.id, role: user.role, email: user.email });

    res.json({ success: true, message: "Login successful.", token, user });
  } catch (error) {
    console.error("Failed to log in:", error.message);
    res.status(500).json({ success: false, message: "Unable to login right now." });
  }
});

app.get("/api/auth/security-question", async (req, res) => {
  const normalizedEmail = normalizeEmail(req.query.email);

  if (!normalizedEmail) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  try {
    const [rows] = await promiseDb.query(
      "SELECT security_question FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "No account found for this email." });
    }

    res.json({ success: true, securityQuestion: rows[0].security_question });
  } catch (error) {
    console.error("Failed to fetch security question:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch the security question right now." });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.email);
  const normalizedAnswer = String(req.body.securityAnswer || "").trim().toLowerCase();
  const newPassword = String(req.body.newPassword || "");

  if (!normalizedEmail || !normalizedAnswer || !newPassword) {
    return res.status(400).json({ success: false, message: "Email, security answer, and new password are required." });
  }

  try {
    const [rows] = await promiseDb.query("SELECT * FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "No account found for this email." });
    }

    if (!verifyHash(normalizedAnswer, rows[0].security_answer_hash)) {
      return res.status(401).json({ success: false, message: "Security answer does not match our records." });
    }

    await promiseDb.query("UPDATE users SET password_hash = ? WHERE id = ?", [createHash(newPassword), rows[0].id]);
    res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Failed to reset password:", error.message);
    res.status(500).json({ success: false, message: "Unable to reset password right now." });
  }
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

app.put("/api/auth/profile", authMiddleware, async (req, res) => {
  const name = String(req.body.name || "").trim();

  if (!name) {
    return res.status(400).json({ success: false, message: "Name is required." });
  }

  try {
    await promiseDb.query("UPDATE users SET name = ? WHERE id = ?", [name, req.user.id]);
    const [rows] = await promiseDb.query("SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1", [req.user.id]);
    res.json({ success: true, message: "Profile updated successfully.", user: sanitizeUser(rows[0]) });
  } catch (error) {
    console.error("Failed to update profile:", error.message);
    res.status(500).json({ success: false, message: "Unable to update profile right now." });
  }
});


app.get("/api/admin/summary", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [[productStats], [orderStats], [customerStats]] = await Promise.all([
      promiseDb.query("SELECT COUNT(*) AS totalProducts FROM products"),
      promiseDb.query(
        `SELECT COUNT(*) AS totalOrders, COALESCE(SUM(total_amount), 0) AS totalRevenue
         FROM orders
         WHERE status <> 'cancelled'`
      ),
      promiseDb.query("SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'")
    ]);

    res.json({
      success: true,
      summary: {
        totalProducts: Number(productStats[0].totalProducts || 0),
        totalOrders: Number(orderStats[0].totalOrders || 0),
        totalRevenue: Number(orderStats[0].totalRevenue || 0),
        totalCustomers: Number(customerStats[0].totalCustomers || 0),
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin summary:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch admin summary right now." });
  }
});

app.get("/api/admin/categories", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [rows] = await promiseDb.query(
      `SELECT category, COUNT(*) AS product_count
       FROM products
       GROUP BY category
       ORDER BY category ASC`
    );

    res.json({
      success: true,
      categories: rows.map((row) => ({
        name: row.category,
        productCount: Number(row.product_count),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch admin categories:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch categories right now." });
  }
});

app.patch("/api/admin/categories", authMiddleware, requireAdmin, async (req, res) => {
  const currentName = String(req.body.currentName || "").trim();
  const nextName = String(req.body.nextName || "").trim();

  if (!currentName || !nextName) {
    return res.status(400).json({ success: false, message: "Current category and new category name are required." });
  }

  try {
    const [result] = await promiseDb.query(
      "UPDATE products SET category = ? WHERE category = ?",
      [nextName, currentName]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, message: "Category updated successfully." });
  } catch (error) {
    console.error("Failed to update category:", error.message);
    res.status(500).json({ success: false, message: "Unable to update category right now." });
  }
});

app.get("/api/admin/customers", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [rows] = await promiseDb.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.role,
         u.created_at,
         COUNT(o.id) AS total_orders
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE u.role = 'customer'
       GROUP BY u.id, u.name, u.email, u.role, u.created_at
       ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      customers: rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
        totalOrders: Number(row.total_orders),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch admin customers:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch customers right now." });
  }
});
app.get("/api/admin/orders", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [rows] = await promiseDb.query(
      `SELECT
         o.id AS orderId,
         o.user_id,
         o.status,
         o.payment_method,
         o.payment_status,
         o.payment_reference,
         o.shipping_address,
         o.cancel_reason,
         o.total_amount,
         o.created_at,
         u.name AS customer_name,
         u.email AS customer_email,
         oi.id AS orderItemId,
         oi.product_id,
         oi.quantity,
         oi.unit_price,
         p.name,
         p.image,
         p.category
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       ORDER BY o.created_at DESC, oi.id ASC`
    );

    res.json({ success: true, orders: formatOrderRows(rows) });
  } catch (error) {
    console.error("Failed to fetch admin orders:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch admin orders right now." });
  }
});

app.patch("/api/admin/orders/:orderId/status", authMiddleware, requireAdmin, async (req, res) => {
  const orderId = Number(req.params.orderId);
  const status = String(req.body.status || "").trim();

  if (!validOrderStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Please choose a valid order status." });
  }

  try {
    const [result] = await promiseDb.query(
      `UPDATE orders
       SET status = ?,
           cancel_reason = CASE WHEN ? <> 'cancelled' THEN NULL ELSE cancel_reason END,
           payment_status = CASE
             WHEN ? = 'cancelled' AND payment_method = 'Cash on Delivery' THEN 'cancelled'
             WHEN ? = 'cancelled' THEN 'refunded'
             WHEN ? = 'delivered' AND payment_method = 'Cash on Delivery' THEN 'paid'
             ELSE payment_status
           END
       WHERE id = ?`,
      [status, status, status, status, status, orderId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.json({ success: true, message: "Order status updated successfully." });
  } catch (error) {
    console.error("Failed to update order status:", error.message);
    res.status(500).json({ success: false, message: "Unable to update order status right now." });
  }
});


app.get("/api/wishlist", authMiddleware, async (req, res) => {
  try {
    const [rows] = await promiseDb.query(
      `SELECT wi.id AS wishlistItemId, p.*
       FROM wishlist_items wi
       JOIN products p ON p.id = wi.product_id
       WHERE wi.user_id = ?
       ORDER BY wi.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, items: normalizeWishlistRows(rows) });
  } catch (error) {
    console.error("Failed to fetch wishlist:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch wishlist right now." });
  }
});

app.post("/api/wishlist", authMiddleware, async (req, res) => {
  const productId = Number(req.body.productId);

  if (Number.isNaN(productId)) {
    return res.status(400).json({ success: false, message: "A valid product is required." });
  }

  try {
    const [products] = await promiseDb.query("SELECT id FROM products WHERE id = ? LIMIT 1", [productId]);
    if (!products.length) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    await promiseDb.query(
      `INSERT INTO wishlist_items (user_id, product_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE product_id = VALUES(product_id)`,
      [req.user.id, productId]
    );

    res.status(201).json({ success: true, message: "Product saved to wishlist." });
  } catch (error) {
    console.error("Failed to add wishlist item:", error.message);
    res.status(500).json({ success: false, message: "Unable to save wishlist item." });
  }
});

app.delete("/api/wishlist/:wishlistItemId", authMiddleware, async (req, res) => {
  const wishlistItemId = Number(req.params.wishlistItemId);

  try {
    const [result] = await promiseDb.query(
      "DELETE FROM wishlist_items WHERE id = ? AND user_id = ?",
      [wishlistItemId, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Wishlist item not found." });
    }

    res.json({ success: true, message: "Removed from wishlist." });
  } catch (error) {
    console.error("Failed to remove wishlist item:", error.message);
    res.status(500).json({ success: false, message: "Unable to remove wishlist item." });
  }
});

app.get("/api/cart", authMiddleware, async (req, res) => {
  try {
    const [rows] = await promiseDb.query(
      `SELECT ci.id AS cartItemId, ci.quantity, p.*
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.updated_at DESC`,
      [req.user.id]
    );

    const items = normalizeCartRows(rows);
    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

    res.json({ success: true, items, totalAmount });
  } catch (error) {
    console.error("Failed to fetch cart:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch cart right now." });
  }
});

app.post("/api/cart", authMiddleware, async (req, res) => {
  const productId = Number(req.body.productId);
  const quantity = Math.max(1, Number(req.body.quantity || 1));

  if (Number.isNaN(productId)) {
    return res.status(400).json({ success: false, message: "A valid product is required." });
  }

  try {
    const [products] = await promiseDb.query("SELECT id FROM products WHERE id = ? LIMIT 1", [productId]);
    if (!products.length) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    await promiseDb.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, productId, quantity]
    );

    res.status(201).json({ success: true, message: "Product added to cart." });
  } catch (error) {
    console.error("Failed to add to cart:", error.message);
    res.status(500).json({ success: false, message: "Unable to add item to cart." });
  }
});

app.patch("/api/cart/:cartItemId", authMiddleware, async (req, res) => {
  const cartItemId = Number(req.params.cartItemId);
  const quantity = Number(req.body.quantity);

  if (Number.isNaN(cartItemId) || Number.isNaN(quantity) || quantity < 1) {
    return res.status(400).json({ success: false, message: "A valid quantity is required." });
  }

  try {
    const [result] = await promiseDb.query(
      "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?",
      [quantity, cartItemId, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    res.json({ success: true, message: "Cart updated successfully." });
  } catch (error) {
    console.error("Failed to update cart:", error.message);
    res.status(500).json({ success: false, message: "Unable to update cart right now." });
  }
});

app.delete("/api/cart/:cartItemId", authMiddleware, async (req, res) => {
  const cartItemId = Number(req.params.cartItemId);

  try {
    const [result] = await promiseDb.query(
      "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
      [cartItemId, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    res.json({ success: true, message: "Item removed from cart." });
  } catch (error) {
    console.error("Failed to remove cart item:", error.message);
    res.status(500).json({ success: false, message: "Unable to remove item right now." });
  }
});

app.get("/api/addresses", authMiddleware, async (req, res) => {
  try {
    const [rows] = await promiseDb.query(
      `SELECT *
       FROM addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, updated_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, addresses: rows.map(formatAddress) });
  } catch (error) {
    console.error("Failed to fetch addresses:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch saved addresses right now." });
  }
});

app.post("/api/addresses", authMiddleware, async (req, res) => {
  const address = normalizeAddressInput(req.body);

  if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.postalCode) {
    return res.status(400).json({
      success: false,
      message: "Full name, phone, line 1, city, state, and postal code are required.",
    });
  }

  try {
    const [existingRows] = await promiseDb.query(
      "SELECT id FROM addresses WHERE user_id = ? LIMIT 1",
      [req.user.id]
    );
    const shouldSetDefault = address.isDefault || !existingRows.length;

    await promiseDb.beginTransaction();

    if (shouldSetDefault) {
      await promiseDb.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [req.user.id]);
    }

    const [result] = await promiseDb.query(
      `INSERT INTO addresses (user_id, label, full_name, phone, line1, line2, city, state, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        address.label,
        address.fullName,
        address.phone,
        address.line1,
        address.line2 || null,
        address.city,
        address.state,
        address.postalCode,
        address.country,
        shouldSetDefault,
      ]
    );

    await promiseDb.commit();

    const [rows] = await promiseDb.query("SELECT * FROM addresses WHERE id = ? LIMIT 1", [result.insertId]);
    res.status(201).json({
      success: true,
      message: "Address saved successfully.",
      address: formatAddress(rows[0]),
    });
  } catch (error) {
    await promiseDb.rollback();
    console.error("Failed to save address:", error.message);
    res.status(500).json({ success: false, message: "Unable to save address right now." });
  }
});

app.put("/api/addresses/:addressId", authMiddleware, async (req, res) => {
  const addressId = Number(req.params.addressId);
  const address = normalizeAddressInput(req.body);

  if (Number.isNaN(addressId)) {
    return res.status(400).json({ success: false, message: "A valid address is required." });
  }

  if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.postalCode) {
    return res.status(400).json({
      success: false,
      message: "Full name, phone, line 1, city, state, and postal code are required.",
    });
  }

  try {
    await promiseDb.beginTransaction();

    if (address.isDefault) {
      await promiseDb.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [req.user.id]);
    }

    const [result] = await promiseDb.query(
      `UPDATE addresses
       SET label = ?, full_name = ?, phone = ?, line1 = ?, line2 = ?, city = ?, state = ?, postal_code = ?, country = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        address.label,
        address.fullName,
        address.phone,
        address.line1,
        address.line2 || null,
        address.city,
        address.state,
        address.postalCode,
        address.country,
        address.isDefault,
        addressId,
        req.user.id,
      ]
    );

    if (!result.affectedRows) {
      await promiseDb.rollback();
      return res.status(404).json({ success: false, message: "Address not found." });
    }

    const [defaultRows] = await promiseDb.query(
      "SELECT id FROM addresses WHERE user_id = ? AND is_default = TRUE LIMIT 1",
      [req.user.id]
    );

    if (!defaultRows.length) {
      await promiseDb.query(
        "UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?",
        [addressId, req.user.id]
      );
    }

    await promiseDb.commit();

    const [rows] = await promiseDb.query("SELECT * FROM addresses WHERE id = ? AND user_id = ? LIMIT 1", [addressId, req.user.id]);
    res.json({ success: true, message: "Address updated successfully.", address: formatAddress(rows[0]) });
  } catch (error) {
    await promiseDb.rollback();
    console.error("Failed to update address:", error.message);
    res.status(500).json({ success: false, message: "Unable to update address right now." });
  }
});

app.patch("/api/addresses/:addressId/default", authMiddleware, async (req, res) => {
  const addressId = Number(req.params.addressId);

  if (Number.isNaN(addressId)) {
    return res.status(400).json({ success: false, message: "A valid address is required." });
  }

  try {
    await promiseDb.beginTransaction();
    const [rows] = await promiseDb.query(
      "SELECT id FROM addresses WHERE id = ? AND user_id = ? LIMIT 1",
      [addressId, req.user.id]
    );

    if (!rows.length) {
      await promiseDb.rollback();
      return res.status(404).json({ success: false, message: "Address not found." });
    }

    await promiseDb.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [req.user.id]);
    await promiseDb.query("UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?", [addressId, req.user.id]);
    await promiseDb.commit();

    res.json({ success: true, message: "Default address updated successfully." });
  } catch (error) {
    await promiseDb.rollback();
    console.error("Failed to set default address:", error.message);
    res.status(500).json({ success: false, message: "Unable to update the default address right now." });
  }
});

app.delete("/api/addresses/:addressId", authMiddleware, async (req, res) => {
  const addressId = Number(req.params.addressId);

  if (Number.isNaN(addressId)) {
    return res.status(400).json({ success: false, message: "A valid address is required." });
  }

  try {
    await promiseDb.beginTransaction();

    const [rows] = await promiseDb.query(
      "SELECT id, is_default FROM addresses WHERE id = ? AND user_id = ? LIMIT 1",
      [addressId, req.user.id]
    );

    if (!rows.length) {
      await promiseDb.rollback();
      return res.status(404).json({ success: false, message: "Address not found." });
    }

    await promiseDb.query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [addressId, req.user.id]);

    if (rows[0].is_default) {
      const [remainingRows] = await promiseDb.query(
        "SELECT id FROM addresses WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1",
        [req.user.id]
      );

      if (remainingRows.length) {
        await promiseDb.query("UPDATE addresses SET is_default = TRUE WHERE id = ?", [remainingRows[0].id]);
      }
    }

    await promiseDb.commit();
    res.json({ success: true, message: "Address removed successfully." });
  } catch (error) {
    await promiseDb.rollback();
    console.error("Failed to remove address:", error.message);
    res.status(500).json({ success: false, message: "Unable to remove address right now." });
  }
});
app.post("/api/orders", authMiddleware, async (req, res) => {
  const shippingAddress = String(req.body.shippingAddress || "").trim();
  const paymentMethod = String(req.body.paymentMethod || "").trim();
  const paymentReference = String(req.body.paymentReference || "").trim();
  const requestedPaymentStatus = String(req.body.paymentStatus || "").trim().toLowerCase();
  const addressId = Number(req.body.addressId);
  let finalShippingAddress = shippingAddress;

  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: "Please choose a valid payment method." });
  }

  const normalizedPaymentStatus =
    paymentMethod === "Cash on Delivery"
      ? "pending"
      : requestedPaymentStatus === "paid"
        ? "paid"
        : "pending";

  try {
    await promiseDb.beginTransaction();

    if (!Number.isNaN(addressId)) {
      const [addressRows] = await promiseDb.query(
        "SELECT * FROM addresses WHERE id = ? AND user_id = ? LIMIT 1",
        [addressId, req.user.id]
      );

      if (!addressRows.length) {
        await promiseDb.rollback();
        return res.status(404).json({ success: false, message: "Saved address not found." });
      }

      finalShippingAddress = buildShippingAddress(addressRows[0]);
    }

    if (!finalShippingAddress) {
      await promiseDb.rollback();
      return res.status(400).json({ success: false, message: "Shipping address is required." });
    }

    const [cartRows] = await promiseDb.query(
      `SELECT ci.id AS cartItemId, ci.quantity, p.id AS productId, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (!cartRows.length) {
      await promiseDb.rollback();
      return res.status(400).json({ success: false, message: "Your cart is empty." });
    }

    const totalAmount = cartRows.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const [orderResult] = await promiseDb.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_status, payment_reference) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, totalAmount, finalShippingAddress, paymentMethod, normalizedPaymentStatus, paymentReference || null]
    );

    for (const item of cartRows) {
      await promiseDb.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderResult.insertId, item.productId, item.quantity, item.price]
      );
    }

    await promiseDb.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
    await promiseDb.commit();

    res.status(201).json({ success: true, message: "Order placed successfully.", orderId: orderResult.insertId });
  } catch (error) {
    await promiseDb.rollback();
    console.error("Failed to place order:", error.message);
    res.status(500).json({ success: false, message: "Unable to place order right now." });
  }
});

app.get("/api/orders/:orderId", authMiddleware, async (req, res) => {
  const orderId = Number(req.params.orderId);

  if (Number.isNaN(orderId)) {
    return res.status(400).json({ success: false, message: "A valid order is required." });
  }

  try {
    const [rows] = await promiseDb.query(
      `SELECT
         o.id AS orderId,
         o.status,
         o.payment_method,
         o.payment_status,
         o.payment_reference,
         o.shipping_address,
         o.cancel_reason,
         o.total_amount,
         o.created_at,
         oi.id AS orderItemId,
         oi.product_id,
         oi.quantity,
         oi.unit_price,
         p.name,
         p.image,
         p.category
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = ? AND o.id = ?
       ORDER BY oi.id ASC`,
      [req.user.id, orderId]
    );

    const order = formatOrderRows(rows)[0];
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Failed to fetch order details:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch order details right now." });
  }
});

app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const [rows] = await promiseDb.query(
      `SELECT
         o.id AS orderId,
         o.status,
         o.payment_method,
         o.payment_status,
         o.payment_reference,
         o.shipping_address,
         o.cancel_reason,
         o.total_amount,
         o.created_at,
         oi.id AS orderItemId,
         oi.product_id,
         oi.quantity,
         oi.unit_price,
         p.name,
         p.image,
         p.category
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC, oi.id ASC`,
      [req.user.id]
    );

    res.json({ success: true, orders: formatOrderRows(rows) });
  } catch (error) {
    console.error("Failed to fetch orders:", error.message);
    res.status(500).json({ success: false, message: "Unable to fetch orders right now." });
  }
});

app.patch("/api/orders/:orderId/cancel", authMiddleware, async (req, res) => {
  const orderId = Number(req.params.orderId);
  const cancelReason = String(req.body.cancelReason || "").trim();

  if (!cancelReason) {
    return res.status(400).json({ success: false, message: "Please provide a cancellation reason." });
  }

  try {
    const [result] = await promiseDb.query(
      `UPDATE orders
       SET status = 'cancelled', cancel_reason = ?
       WHERE id = ? AND user_id = ? AND status NOT IN ('delivered', 'cancelled')`,
      [cancelReason, orderId, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(400).json({ success: false, message: "This order cannot be cancelled now." });
    }

    res.json({ success: true, message: "Order cancelled successfully." });
  } catch (error) {
    console.error("Failed to cancel order:", error.message);
    res.status(500).json({ success: false, message: "Unable to cancel order right now." });
  }
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/student", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "student.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  });

















