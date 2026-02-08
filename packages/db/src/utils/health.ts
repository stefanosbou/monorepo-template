import { primaryDb } from "../client";
import { todos } from "../schema";

export type HealthCheckResult = { ok: boolean; details?: string };

export async function checkDb(): Promise<HealthCheckResult> {
  try {
    // lightweight query using the existing drizzle client/pool
    await primaryDb
      .select()
      .from(todos)
      .limit(1)
      .then(() => undefined);
    return { ok: true, details: "db reachable" };
  } catch (err: any) {
    return { ok: false, details: err?.message ?? String(err) };
  }
}
