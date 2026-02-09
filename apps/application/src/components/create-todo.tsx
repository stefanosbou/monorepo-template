"use client";

import { revalidateAfterTodoChange } from "@/actions/revalidate-action";
import { useTRPC } from "@/trpc/client";
import { Button } from "@humblebrag/ui/components/button";
import { Input } from "@humblebrag/ui/components/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const CreateTodo = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createTodoMutation = useMutation(
    trpc.todos.create.mutationOptions({
      onSuccess: async (todoId) => {
        const successId = `todo_creation_success_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log(`[${successId}] Todo creation mutation successful`, {
          todoId,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        });

        // Lock the form permanently - never reset on success
        setIsLoading(true);

        try {
          // Invalidate all queries to ensure fresh data everywhere
          console.log(`[${successId}] Invalidating queries`);
          await queryClient.invalidateQueries();

          // Revalidate server-side paths and redirect
          console.log(`[${successId}] Revalidating server-side paths`);
          await revalidateAfterTodoChange();

          console.log(
            `[${successId}] Team creation flow completed successfully`,
          );
        } catch (error) {
          // Check if this is a Next.js redirect (expected behavior)
          if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            console.log(
              `[${successId}] Team creation completed successfully - redirecting to home`,
            );
            // This is expected - Next.js redirects work by throwing this error
            return;
          }

          // Only log actual errors, not expected redirects
          console.error(`[${successId}] Todo creation flow failed:`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            todoId,
          });
        }
        // Note: We NEVER reset loading state on success - user should be redirected
      },
      onError: (error) => {
        const errorId = `todo_creation_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const errorContext = {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        };

        console.error(
          `[${errorId}] Team creation mutation failed`,
          errorContext,
        );

        // // Capture error in Sentry for debugging
        // if (error instanceof Error && process.env.NODE_ENV === "production") {
        //   import("@sentry/nextjs").then((Sentry) => {
        //     Sentry.captureException(error, {
        //       extra: {
        //         ...errorContext,
        //         errorId,
        //         component: "CreateTeamForm",
        //         action: "team_creation_mutation",
        //       },
        //     });
        //   });
        // }

        setIsLoading(false);
      },
    }),
  );

  // 2. Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTodoMutation.mutate({ title: content });
  };

  const createTodo = (values: { content: string }) => {
    console.log("Create todo", content);
    createTodoMutation.mutate({
      title: values.content,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="Enter a new todo"
          className="flex-1"
          onChange={(e) => setContent(e.target.value)}
          value={content}
        />
        <Button
          className="w-full mt-2"
          variant="outline"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
};
