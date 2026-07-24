# Task Manifest — Full Stack Task Manager with an MCP Server

A small full stack app: a REST API + database, a React frontend, and an **MCP server**
that exposes the same task data as tools an AI agent (Claude, Cursor, etc.) can call directly.

Built to get hands-on with the Model Context Protocol — the same idea behind
[React Native Stallion's](https://stalliontech.io) own MCP server for managing OTA releases.

## Architecture

```
client/        React app (single-file, no build step) — talks to the REST API
server/        Express REST API + JSON-file database (CRUD for tasks)
mcp-server/    MCP server — wraps the REST API as tools: list_tasks, add_task,
               complete_task, delete_task
```

The MCP server doesn't touch the database directly — it calls the same REST API the
frontend uses. That mirrors how a real product usually adds an MCP layer: as a thin
client on top of an existing API, not a parallel data path.

## Running it

**1. Start the API**
```bash
cd server
npm install
node index.js        # http://localhost:4000
```

**2. Open the frontend**
```bash
cd client
python3 -m http.server 5173   # or just open index.html directly
```

**3. Try the MCP server** (talk to your tasks from Claude Desktop, Cursor, or Claude Code)
```bash
cd mcp-server
npm install
```
Add to your MCP client config (e.g. Claude Desktop's `claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "task-manager": {
      "command": "node",
      "args": ["/absolute/path/to/task-mcp-app/mcp-server/index.js"]
    }
  }
}
```
Then ask your AI client things like *"add a task to fix the rollback bug, high priority"*
or *"what tasks are still pending?"* — it'll call the tools directly.

## API Reference

| Method | Route              | Description                  |
|--------|---------------------|-------------------------------|
| GET    | `/api/tasks`         | List tasks (optional `?status=`) |
| GET    | `/api/tasks/:id`     | Get one task                  |
| POST   | `/api/tasks`         | Create a task                 |
| PATCH  | `/api/tasks/:id`     | Update title/status/priority  |
| DELETE | `/api/tasks/:id`     | Delete a task                 |

## MCP Tools

| Tool | Description |
|------|-------------|
| `list_tasks` | List all tasks, optionally filtered by status |
| `add_task` | Create a task with a title and priority |
| `complete_task` | Mark a task done by id |
| `delete_task` | Delete a task by id |

## Stack

React · Node.js · Express · MCP SDK (`@modelcontextprotocol/sdk`) · Zod
