// Import the shared DB client — adjust path if you prefer to import from the built package
import { primaryDb } from "@humblebrag/db/client";
import { TRPCError, initTRPC } from "@trpc/server";
import type { Context } from "hono";
import superjson from "superjson";

type Session = { userId: string } | null;

type TRPCContext = {
  session: Session | null;
  db: typeof primaryDb;
  forcePrimary?: boolean;
};

export const createTRPCContext = async (
  _: unknown,
  c: Context,
): Promise<TRPCContext> => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  // Minimal: no real token verification here. Remote repo verifies access tokens.
  const session: Session = token ? { userId: token } : null;

  const forcePrimary = c.req.header("x-force-primary") === "true";

  return {
    session,
    db: primaryDb,
    forcePrimary,
  };
};

const t = initTRPC.context<TRPCContext>().create({ transformer: superjson });

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  if (!opts.ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return opts.next();
});

export type TRPCContextType = TRPCContext;
