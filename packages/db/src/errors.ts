export class TodoNotFoundError extends Error {
  code = "TODO_NOT_FOUND" as const;

  constructor() {
    super("Todo not found");
    this.name = "TodoNotFoundError";
  }
}
