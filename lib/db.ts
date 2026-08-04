import mysql from "mysql2/promise";

/**
 * Database Connection Pool
 * ------------------------
 * Serverless-ready MySQL connection pool using mysql2/promise.
 * Reads the unified DATABASE_URL environment variable to determine
 * the target MySQL instance (local Docker or remote cloud).
 *
 * Format: mysql://user:password@host:port/database
 */

// Parse the DATABASE_URL into individual connection parameters.
// Falls back to individual MYSQL_* env vars if DATABASE_URL is absent.
function parseDatabaseUrl(url: string | undefined) {
  if (!url) {
    return {
      host: process.env.MYSQL_HOST || "localhost",
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "todo_user",
      password: process.env.MYSQL_PASSWORD || "todo_password",
      database: process.env.MYSQL_DATABASE || "todo_db",
    };
  }

  // mysql://user:password@host:port/database
  const match = url.match(
    /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/
  );

  if (!match) {
    throw new Error(
      "Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database"
    );
  }

  const [, user, password, host, port, database] = match;

  return {
    host,
    port: Number(port),
    user,
    password,
    database,
  };
}

const config = parseDatabaseUrl(process.env.DATABASE_URL);

/**
 * Global connection pool.
 * Reused across serverless invocations to avoid connection churn.
 */
const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: "utf8mb4_unicode_ci",
});

/**
 * Test the database connection.
 * Used by health checks and startup verification.
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

export default pool;