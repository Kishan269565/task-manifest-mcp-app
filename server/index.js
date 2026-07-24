import express from 'express';
import cors from 'cors';
import { listTasks, getTask, createTask, updateTask, deleteTask } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/tasks - list all tasks, optionally filter by status
app.get('/api/tasks', (req, res) => {
  res.json(listTasks(req.query.status));
});

// GET /api/tasks/:id
app.get('/api/tasks/:id', (req, res) => {
  const task = getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST /api/tasks - create a task
app.post('/api/tasks', async (req, res) => {
  const { title, priority = 'medium' } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const task = await createTask({ title, priority });
  res.status(201).json(task);
});

// PATCH /api/tasks/:id - update status/title/priority
app.patch('/api/tasks/:id', async (req, res) => {
  const existing = getTask(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });
  const { title, status, priority } = req.body;
  const updated = await updateTask(req.params.id, {
    ...(title !== undefined && { title }),
    ...(status !== undefined && { status }),
    ...(priority !== undefined && { priority }),
  });
  res.json(updated);
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', async (req, res) => {
  const ok = await deleteTask(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Task not found' });
  res.status(204).send();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
