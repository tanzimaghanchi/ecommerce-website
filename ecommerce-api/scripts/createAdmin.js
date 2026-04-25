require("dotenv").config();
const crypto = require("crypto");
const { db, promiseDb } = require("../db");

const createHash = (value, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.pbkdf2Sync(value, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const ensureUsersTable = async () => {
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
};

const createAdmin = async () => {
  const name = String(process.env.ADMIN_NAME || "FAISHORA Admin").trim();
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "").trim();
  const securityQuestion = String(
    process.env.ADMIN_SECURITY_QUESTION || "What is your favorite color?"
  ).trim();
  const securityAnswer = String(process.env.ADMIN_SECURITY_ANSWER || "blue").trim().toLowerCase();

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required to create an admin account.");
    process.exitCode = 1;
    db.end();
    return;
  }

  try {
    await ensureUsersTable();
    const [rows] = await promiseDb.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);

    if (rows.length) {
      await promiseDb.query(
        `UPDATE users
         SET name = ?, password_hash = ?, security_question = ?, security_answer_hash = ?, role = 'admin'
         WHERE id = ?`,
        [name, createHash(password), securityQuestion, createHash(securityAnswer), rows[0].id]
      );
      console.log(`Admin account updated: ${email}`);
    } else {
      await promiseDb.query(
        `INSERT INTO users (name, email, password_hash, security_question, security_answer_hash, role)
         VALUES (?, ?, ?, ?, ?, 'admin')`,
        [name, email, createHash(password), securityQuestion, createHash(securityAnswer)]
      );
      console.log(`Admin account created: ${email}`);
    }
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    db.end();
  }
};

createAdmin();
