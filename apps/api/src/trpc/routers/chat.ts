import { mastra } from "@humblebrag/ai/mastra/server";
import type { AgentName } from "@humblebrag/ai/mastra/server";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import z from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

export const chatRouter = createTRPCRouter({
  getAgent: publicProcedure
    .input(z.object({ agentId: z.custom<AgentName>() }))
    .query(async ({ input }) => {
      try {
        const agent = mastra.getAgent(input.agentId);

        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }

        return {
          name: agent,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get agent",
          cause: error,
        });
      }
    }),
  // Check if agent has memory enabled
  getMemory: publicProcedure
    .input(z.object({ agentId: z.custom<AgentName>() }))
    .query(async ({ input }) => {
      try {
        const agent = mastra.getAgent(input.agentId);

        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }

        const memory = await agent.getMemory();

        if (!memory) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agent does not have memory enabled",
          });
        }

        return {
          memory,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get memory status",
          cause: error,
        });
      }
    }),

  // List all threads for an agent
  getThreads: publicProcedure
    .input(
      z.object({
        agentId: z.custom<AgentName>(),
        resourceId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const agent = mastra.getAgent(input.agentId);

        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }

        const memory = await agent.getMemory();

        if (!memory) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agent does not have memory enabled",
          });
        }

        const threads = await memory.listThreads({
          filter: { resourceId: input.resourceId },
        });

        return threads || [];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list threads",
          cause: error,
        });
      }
    }),

  // Get messages for a specific thread
  getThreadMessages: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        agentId: z.custom<AgentName>(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const agent = mastra.getAgent(input.agentId);

        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }

        const memory = await agent.getMemory();

        if (!memory) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agent does not have memory enabled",
          });
        }

        const { messages } = await memory.recall({
          threadId: input.threadId,
        });

        return {
          messages,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get thread messages",
          cause: error,
        });
      }
    }),

  // Delete a thread
  deleteThread: publicProcedure
    .input(
      z.object({
        threadId: z.string(),
        agentId: z.custom<AgentName>(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const agent = mastra.getAgent(input.agentId);

        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }

        const memory = await agent.getMemory();

        if (!memory) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Agent does not have memory enabled",
          });
        }

        await memory.deleteThread(input.threadId);

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete thread",
          cause: error,
        });
      }
    }),

  // Stream chat messages
  streamChat: publicProcedure
    .input(
      z.object({
        agentId: z.custom<AgentName>(),
        message: z.string(),
        threadId: z.string(),
      }),
    )
    .subscription(({ input }) => {
      return observable<{
        type: "chunk" | "finish" | "error";
        content?: string;
        threadId?: string;
        error?: string;
      }>((emit) => {
        let aborted = false;

        const runStream = async () => {
          try {
            const agent = mastra.getAgent(input.agentId);

            if (!agent) {
              emit.next({
                type: "error",
                error: "Agent not found",
              });
              emit.complete();
              return;
            }

            // Generate response with streaming
            const stream = await agent.stream(input.message, {
              memory: {
                resource: "default", // You can customize this based on your needs
                thread: input.threadId, // Continue the thread if threadId is provided
              },
            });

            for await (const chunk of stream.textStream) {
              if (aborted) break;

              emit.next({
                type: "chunk",
                content: chunk,
              });
            }

            if (!aborted) {
              const result = await stream.text;

              emit.next({
                type: "finish",
                threadId: input.threadId,
              });

              emit.complete();
            }
          } catch (error) {
            if (!aborted) {
              emit.next({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              });
              emit.complete();
            }
          }
        };

        runStream();

        // Cleanup function
        return () => {
          aborted = true;
        };
      });
    }),

  // Non-streaming chat (for simpler use cases)
  sendMessage: publicProcedure
    .input(
      z.object({
        agentId: z.custom<AgentName>(),
        message: z.string(),
        threadId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const agent = mastra.getAgent(input.agentId);

        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }

        const response = await agent.generate(input.message, {
          memory: {
            resource: "default", // You can customize this based on your needs
            thread: input.threadId, // Continue the thread if threadId is provided
          },
        });

        return {
          text: response.text,
          threadId: input.threadId,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
          cause: error,
        });
      }
    }),
});
