import mysql from "mysql2/promise";

let pool = null;

export function isDbConfigured() {
  return Boolean(
    process.env.DB_HOST &&
    process.env.DB_NAME &&
    process.env.DB_USER
  );
}

export function getPool() {
  if (!isDbConfigured()) {
    return null;
  }

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}

/**
 * Execute raw SQL query with parameters using mysql2 connection pool.
 * No ORM is used.
 */
export async function query(sql, params = []) {
  const p = getPool();
  if (!p) {
    throw new Error(
      "Database not configured. Please ensure DB_HOST, DB_NAME, and DB_USER are defined in .env.local"
    );
  }
  const [rows] = await p.query(sql, params);
  return rows;
}

/**
 * Execute raw SQL statement with parameters (for INSERT, UPDATE, DELETE).
 */
export async function execute(sql, params = []) {
  const p = getPool();
  if (!p) {
    throw new Error(
      "Database not configured. Please ensure DB_HOST, DB_NAME, and DB_USER are defined in .env.local"
    );
  }
  const [result] = await p.execute(sql, params);
  return result;
}

export default {
  getPool,
  isDbConfigured,
  query,
  execute,
};
