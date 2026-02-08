import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm/table";

export const todos = pgTable("todos", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type TodoRow = InferSelectModel<typeof todos>;
