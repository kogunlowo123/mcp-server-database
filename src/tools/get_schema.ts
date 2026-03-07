import { z } from "zod";
import { getConnection } from "../connection";

export const getSchemaSchema = z.object({});

export type GetSchemaInput = z.infer<typeof getSchemaSchema>;

export async function getSchema(_input: GetSchemaInput): Promise<string> {
  const conn = getConnection();

  let sql: string;

  switch (conn.driver) {
    case "postgres":
      sql = `
        SELECT
          'CREATE TABLE ' || table_name || ' (' ||
          string_agg(
            column_name || ' ' || data_type ||
            CASE WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')' ELSE '' END ||
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
            CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
            ', '
          ) || ');' AS ddl
        FROM information_schema.columns
        WHERE table_schema = 'public'
        GROUP BY table_name
        ORDER BY table_name
      `;
      break;
    case "mysql":
      sql = `
        SELECT table_name, GROUP_CONCAT(
          CONCAT(column_name, ' ', column_type,
            IF(is_nullable = 'NO', ' NOT NULL', ''),
            IF(column_default IS NOT NULL, CONCAT(' DEFAULT ', quote(column_default)), '')
          ) SEPARATOR ', '
        ) AS columns_def
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        GROUP BY table_name
        ORDER BY table_name
      `;
      break;
    case "sqlite":
      sql = `SELECT sql AS ddl FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`;
      break;
  }

  const rows = await conn.query(sql);
  return JSON.stringify(rows, null, 2);
}
