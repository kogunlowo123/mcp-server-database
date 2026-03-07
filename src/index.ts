import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { querySchema, query } from "./tools/query";
import { listTablesSchema, listTables } from "./tools/list_tables";
import { describeTableSchema, describeTable } from "./tools/describe_table";
import { listDatabasesSchema, listDatabases } from "./tools/list_databases";
import { executeMigrationSchema, executeMigration } from "./tools/execute_migration";
import { getSchemaSchema, getSchema } from "./tools/get_schema";

const server = new McpServer({
  name: "mcp-server-database",
  version: "1.0.0",
});

server.tool(
  "query",
  "Execute a SQL query against the configured database (PostgreSQL, MySQL, or SQLite)",
  querySchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await query(input) }],
  })
);

server.tool(
  "list_tables",
  "List all tables in the connected database",
  listTablesSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await listTables(input) }],
  })
);

server.tool(
  "describe_table",
  "Describe the columns and schema of a specific table",
  describeTableSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await describeTable(input) }],
  })
);

server.tool(
  "list_databases",
  "List all databases available on the connected server",
  listDatabasesSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await listDatabases(input) }],
  })
);

server.tool(
  "execute_migration",
  "Execute a SQL migration script with multiple statements",
  executeMigrationSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await executeMigration(input) }],
  })
);

server.tool(
  "get_schema",
  "Get the full database schema as DDL statements",
  getSchemaSchema.shape,
  async (input) => ({
    content: [{ type: "text", text: await getSchema(input) }],
  })
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-server-database running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
