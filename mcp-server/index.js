#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_BASE = process.env.TASKS_API_URL || 'http://localhost:4000/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body;
}

const server = new McpServer({
  name: 'task-manager-mcp',
  version: '1.0.0',
});

server.registerTool(
  'list_tasks',
  {
    title: 'List tasks',
    description: 'List all tasks, optionally filtered by status (pending or done).',
    inputSchema: {
      status: z.enum(['pending', 'done']).optional().describe('Filter tasks by status'),
    },
  },
  async ({ status }) => {
    const query = status ? `?status=${status}` : '';
    const tasks = await apiFetch(`/tasks${query}`);
    return { content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }] };
  }
);

server.registerTool(
  'add_task',
  {
    title: 'Add task',
    description: 'Create a new task with a title and optional priority.',
    inputSchema: {
      title: z.string().min(1).describe('The task title'),
      priority: z.enum(['low', 'medium', 'high']).optional().describe('Task priority'),
    },
  },
  async ({ title, priority }) => {
    const task = await apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title, priority }),
    });
    return { content: [{ type: 'text', text: `Created task #${task.id}: "${task.title}"` }] };
  }
);

server.registerTool(
  'complete_task',
  {
    title: 'Complete task',
    description: 'Mark a task as done by its id.',
    inputSchema: {
      id: z.number().int().describe('The task id to mark complete'),
    },
  },
  async ({ id }) => {
    const task = await apiFetch(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'done' }),
    });
    return { content: [{ type: 'text', text: `Marked task #${task.id} as done.` }] };
  }
);

server.registerTool(
  'delete_task',
  {
    title: 'Delete task',
    description: 'Permanently delete a task by its id.',
    inputSchema: {
      id: z.number().int().describe('The task id to delete'),
    },
  },
  async ({ id }) => {
    await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
    return { content: [{ type: 'text', text: `Deleted task #${id}.` }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Task Manager MCP server running on stdio');
