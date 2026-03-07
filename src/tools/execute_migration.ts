import { z } from "zod";
import { getConnection } from "../connection";

export const executeMigrationSchema = z.object({
  sql: z.string().describe("SQL migration script to execute"),
});

export type ExecuteMigrationInput = z.infer<typeof executeMigrationSchema>;

export async function executeMigration(input: ExecuteMigrationInput): Promise<string> {
  const conn = getConnection();

  const statements = input.sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const results: Array<{ statement: string; result: Record<string, unknown>[] }> = [];

  for (const statement of statements) {
    const result = await conn.query(statement);
    results.push({ statement, result });
  }

  return JSON.stringify(
    { statementsExecuted: results.length, results },
    null,
    2
  );
}
