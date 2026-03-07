import { z } from "zod";
import { getConnection } from "../connection";

export const describeTableSchema = z.object({
  table_name: z.string().describe("Name of the table to describe"),
});

export type DescribeTableInput = z.infer<typeof describeTableSchema>;

export async function describeTable(input: DescribeTableInput): Promise<string> {
  const conn = getConnection();

  let sql: string;
  let params: unknown[] | undefined;

  switch (conn.driver) {
    case "postgres":
      sql = `SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
             FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = $1
             ORDER BY ordinal_position`;
      params = [input.table_name];
      break;
    case "mysql":
      sql = `DESCRIBE ??`;
      params = [input.table_name];
      break;
    case "sqlite":
      sql = `PRAGMA table_info("${input.table_name}")`;
      break;
  }

  const rows = await conn.query(sql, params);
  return JSON.stringify({ table: input.table_name, columns: rows }, null, 2);
}
