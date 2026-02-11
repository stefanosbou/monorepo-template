import { useTRPC } from "@/trpc/client";
import type { AgentName } from "@humblebrag/ai/mastra";
import { useQuery } from "@tanstack/react-query";

export const useMemory = (agentId: AgentName) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.chat.getMemory.queryOptions({ agentId }),
  });
};
