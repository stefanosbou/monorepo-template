# @humblebrag/db

Simple SQLite-backed Todo store for the monorepo.

Usage:

```ts
import db from "@humblebrag/db";

// initialize (optional path)
db.initDB();

// create
const todo = db.createTodo("Buy milk");

// list
const all = db.listTodos();
```

The package uses `better-sqlite3` and writes to `./data/dev.sqlite` by default. Set `HUMBLEBRAG_DB_PATH` to change location.
