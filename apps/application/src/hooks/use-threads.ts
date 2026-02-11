import { useTRPC } from "@/trpc/client";
import type { AgentName } from "@humblebrag/ai/mastra";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useThreads = (agentId: AgentName, userId: string) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.chat.getThreads.queryOptions({ agentId, resourceId: userId }),
  });
};

export const useThreadMessages = (agentId: AgentName, threadId: string) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.chat.getThreadMessages.queryOptions({ agentId, threadId }),
    staleTime: 0, // Always fetch fresh messages when threadId changes
    gcTime: 0, // Don't garbage collect messages to allow refetching after deletion
    retry: false, // Don't retry on failure to avoid issues with deleted threads
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid issues with deleted threads
  });
};

export const useDeleteThread = (agentId: AgentName, threadId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.chat.deleteThread.mutationOptions({
      onMutate: async (newData) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.chat.getThreads.queryKey({
            agentId,
            resourceId: threadId,
          }),
        });

        await queryClient.cancelQueries({
          queryKey: trpc.chat.getThreadMessages.queryKey({ agentId, threadId }),
        });

        // Get current data
        const previousData = queryClient.getQueryData(
          trpc.chat.getThreads.queryKey({ agentId, resourceId: threadId }),
        );

        // Optimistically update
        queryClient.setQueryData(
          trpc.chat.getThreads.queryKey({ agentId, resourceId: threadId }),
          (old: any) => ({
            ...old,
            ...newData,
          }),
        );

        queryClient.setQueryData(
          trpc.chat.getThreadMessages.queryKey({ agentId, threadId }),
          () => ({ messages: [] }),
        );

        return { previousData };
      },
      onError: (_, __, context) => {
        // Rollback on error
        queryClient.setQueryData(
          trpc.chat.getThreads.queryKey({ agentId, resourceId: threadId }),
          context?.previousData,
        );
      },
      onSettled: () => {
        // Refetch after error or success
        queryClient.invalidateQueries({
          queryKey: trpc.chat.getThreads.queryKey({
            agentId,
            resourceId: threadId,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.chat.getThreadMessages.queryKey({ agentId, threadId }),
        });
      },
    }),
  });
};
