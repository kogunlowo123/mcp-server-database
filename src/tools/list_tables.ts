import { z } from "zod";
import { getConnection } from "../connection";

export const listTablesSchema = z.object({});

export type ListTablesInput = z.infer<typeof listTablesSchema>;

export async function listTables(_input: ListTablesInput): Promise<string> {
  const conn = getConnection();

  let sql: string;
  switch (conn.driver) {
    case "postgres":
      sql = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
      break;
    case "mysql":
      sql = `SHOW TABLES`;
      break;
    case "sqlite":
      sql = `SELECT name AS table_name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`;
      break;
  }

  const rows = await conn.query(sql);
  return JSON.stringify(rows, null, 2);
}
