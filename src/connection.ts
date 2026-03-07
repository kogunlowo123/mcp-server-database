import { Pool as PgPool } from "pg";
import mysql, { Pool as MySqlPool } from "mysql2/promise";
import Database from "better-sqlite3";

export type DbDriver = "postgres" | "mysql" | "sqlite";

export interface DbConnection {
  driver: DbDriver;
  query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]>;
  close(): Promise<void>;
}

function getDriver(): DbDriver {
  const driver = process.env.DB_DRIVER as DbDriver;
  if (!driver || !["postgres", "mysql", "sqlite"].includes(driver)) {
    throw new Error("DB_DRIVER must be one of: postgres, mysql, sqlite");
  }
  return driver;
}

let connection: DbConnection | null = null;

export function getConnection(): DbConnection {
  if (connection) return connection;

  const driver = getDriver();

  if (driver === "postgres") {
    const pool = new PgPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    connection = {
      driver,
      async query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
        const result = await pool.query(sql, params);
        return result.rows as Record<string, unknown>[];
      },
      async close(): Promise<void> {
        await pool.end();
      },
    };
  } else if (driver === "mysql") {
    const pool: MySqlPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    connection = {
      driver,
      async query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
        const [rows] = await pool.execute(sql, params);
        return rows as Record<string, unknown>[];
      },
      async close(): Promise<void> {
        await pool.end();
      },
    };
  } else {
    const dbPath = process.env.DB_PATH ?? process.env.DB_NAME ?? ":memory:";
    const db = new Database(dbPath);

    connection = {
      driver,
      async query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
        const trimmed = sql.trim().toUpperCase();
        if (trimmed.startsWith("SELECT") || trimmed.startsWith("PRAGMA") || trimmed.startsWith("WITH")) {
          return db.prepare(sql).all(...(params ?? [])) as Record<string, unknown>[];
        }
        const info = db.prepare(sql).run(...(params ?? []));
        return [{ changes: info.changes, lastInsertRowid: info.lastInsertRowid }];
      },
      async close(): Promise<void> {
        db.close();
      },
    };
  }

  return connection;
}
