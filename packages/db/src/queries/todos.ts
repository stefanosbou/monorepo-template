import type { Database } from "@db/client";
import { desc, eq } from "drizzle-orm";
import { type TodoRow, todos } from "../schema";

export async function createTodo(db: Database, title: string) {
  const [row] = await db.insert(todos).values({ title }).returning();
  return row;
}

export async function getTodo(
  db: Database,
  id: string,
): Promise<TodoRow | null> {
  const row = await db
    .select()
    .from(todos)
    .where(eq(todos.id, id))
    .limit(1)
    .then((r) => r[0] || null);
  return row;
}

export async function listTodos(db: Database): Promise<TodoRow[]> {
  const res = await db.select().from(todos).orderBy(desc(todos.createdAt));
  return res;
}

export async function toggleTodo(
  db: Database,
  id: string,
): Promise<TodoRow | null> {
  const current = await getTodo(db, id);
  if (!current) return null;
  await db
    .update(todos)
    .set({ completed: !current.completed })
    .where(eq(todos.id, id));
  return getTodo(db, id);
}

export async function deleteTodo(db: Database, id: string): Promise<boolean> {
  await db.delete(todos).where(eq(todos.id, id));
  return true;
}

export default { createTodo, getTodo, listTodos, toggleTodo, deleteTodo };
