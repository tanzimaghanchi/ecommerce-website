require("dotenv").config();

const { db, promiseDb } = require("../db");
const { products, seededCategories, legacySeededCategories } = require("../data/productSeed");

const ensureProductsTable = async () => {
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
};

const deleteUnreferencedProducts = async (categories) => {
  if (!categories.length) {
    return;
  }

  const placeholders = categories.map(() => "?").join(", ");
  await promiseDb.query(
    `DELETE p
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     WHERE p.category IN (${placeholders}) AND oi.id IS NULL`,
    categories
  );
};

const seedProducts = async () => {
  try {
    await ensureProductsTable();

    const allowedCategories = [...new Set(seededCategories)];
    const categoriesToReplace = [...new Set([...seededCategories, ...legacySeededCategories])];

    const [allCategoryRows] = await promiseDb.query("SELECT DISTINCT category FROM products");
    const removableLegacyCategories = allCategoryRows
      .map((row) => row.category)
      .filter((category) => !allowedCategories.includes(category));

    await deleteUnreferencedProducts(removableLegacyCategories);
    await deleteUnreferencedProducts(categoriesToReplace);

    for (const product of products) {
      await promiseDb.query(
        "INSERT INTO products (name, price, image, category, description) VALUES (?, ?, ?, ?, ?)",
        [product.name, product.price, product.image, product.category, product.description]
      );
    }

    console.log(`Seed complete. Inserted ${products.length} FAISHORA category products.`);
  } catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    db.end();
  }
};

seedProducts();
