import { z } from "zod";
import { getConnection } from "../connection";

export const querySchema = z.object({
  sql: z.string().describe("SQL query to execute"),
  params: z.array(z.unknown()).optional().describe("Query parameters for parameterized queries"),
});

export type QueryInput = z.infer<typeof querySchema>;

export async function query(input: QueryInput): Promise<string> {
  const conn = getConnection();
  const rows = await conn.query(input.sql, input.params as unknown[]);
  return JSON.stringify({ rowCount: rows.length, rows }, null, 2);
}
