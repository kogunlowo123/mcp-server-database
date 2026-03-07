# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-01

### Added
- Initial release of mcp-server-database.
- Tool: `query` - Execute SQL queries against PostgreSQL, MySQL, or SQLite.
- Tool: `list_tables` - List all tables in the connected database.
- Tool: `describe_table` - Describe the schema of a specific table.
- Tool: `list_databases` - List available databases on the server.
- Tool: `execute_migration` - Execute a SQL migration script.
- Tool: `get_schema` - Get the full database schema as DDL.
- Multi-driver support: PostgreSQL, MySQL, SQLite.
- MCP server with stdio transport.
- Docker support.
