import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, 'tasks.json');

const defaultData = { tasks: [], nextId: 1 };

export const db = await JSONFilePreset(dbFile, defaultData);

export function listTasks(status) {
  const { tasks } = db.data;
  return status ? tasks.filter((t) => t.status === status) : tasks;
}

export function getTask(id) {
  return db.data.tasks.find((t) => t.id === Number(id));
}

export async function createTask({ title, priority = 'medium' }) {
  const task = {
    id: db.data.nextId++,
    title: title.trim(),
    status: 'pending',
    priority,
    created_at: new Date().toISOString(),
  };
  db.data.tasks.unshift(task);
  await db.write();
  return task;
}

export async function updateTask(id, updates) {
  const task = getTask(id);
  if (!task) return null;
  Object.assign(task, updates);
  await db.write();
  return task;
}

export async function deleteTask(id) {
  const before = db.data.tasks.length;
  db.data.tasks = db.data.tasks.filter((t) => t.id !== Number(id));
  await db.write();
  return db.data.tasks.length < before;
}
