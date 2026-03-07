import { z } from "zod";
import { getConnection } from "../connection";

export const listDatabasesSchema = z.object({});

export type ListDatabasesInput = z.infer<typeof listDatabasesSchema>;

export async function listDatabases(_input: ListDatabasesInput): Promise<string> {
  const conn = getConnection();

  let sql: string;

  switch (conn.driver) {
    case "postgres":
      sql = `SELECT datname AS database_name FROM pg_database WHERE datistemplate = false ORDER BY datname`;
      break;
    case "mysql":
      sql = `SHOW DATABASES`;
      break;
    case "sqlite":
      return JSON.stringify(
        { message: "SQLite operates on a single file database. Use DB_PATH to specify the database." },
        null,
        2
      );
  }

  const rows = await conn.query(sql);
  return JSON.stringify(rows, null, 2);
}
