import { useTRPC } from "@/trpc/client";
import type { AgentName } from "@humblebrag/ai/mastra";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

export type MastraUIMessage = {
  role: "user" | "assistant";
  parts: Array<{ type: "text"; text: string }>;
};

type UseChatProps = {
  agentId: AgentName;
  initializeMessages: () => MastraUIMessage[];
};

type SendMessageOptions = {
  message: string;
  mode: "stream" | "text";
  threadId: string;
  onChunk?: (chunk: {
    type: string;
    content?: string;
    threadId?: string;
  }) => void;
  signal?: AbortSignal;
};

export const useChat = ({ agentId, initializeMessages }: UseChatProps) => {
  const trpc = useTRPC();
  const [messages, setMessages] =
    useState<MastraUIMessage[]>(initializeMessages);
  const [isRunning, setIsRunning] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessageMutation = useMutation({
    ...trpc.chat.sendMessage.mutationOptions({}),
  });

  const sendMessage = useCallback(
    async (options: SendMessageOptions) => {
      const { message, mode, threadId, onChunk, signal } = options;

      setIsRunning(true);

      // Add user message
      const userMessage: MastraUIMessage = {
        role: "user",
        parts: [{ type: "text", text: message }],
      };

      setMessages((prev) => [...prev, userMessage]);

      // Add empty assistant message for streaming
      const assistantMessageIndex = messages.length + 1;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          parts: [{ type: "text", text: "" }],
        },
      ]);

      try {
        if (mode === "stream") {
          // For streaming, we'd need WebSocket or SSE support in tRPC
          // For now, using regular mutation and simulating streaming
          const response = await sendMessageMutation.mutateAsync({
            agentId,
            message,
            threadId,
          });

          // Update the assistant message
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[assistantMessageIndex] = {
              role: "assistant",
              parts: [{ type: "text", text: response.text }],
            };
            return newMessages;
          });

          onChunk?.({
            type: "finish",
            threadId: response.threadId,
          });
        } else {
          const response = await sendMessageMutation.mutateAsync({
            agentId,
            message,
            threadId,
          });

          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[assistantMessageIndex] = {
              role: "assistant",
              parts: [{ type: "text", text: response.text }],
            };
            return newMessages;
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);

        // Update with error message
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = {
            role: "assistant",
            parts: [
              {
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            ],
          };
          return newMessages;
        });

        throw error;
      } finally {
        setIsRunning(false);
      }
    },
    [agentId, messages.length, sendMessageMutation],
  );

  const cancelRun = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  return {
    messages,
    sendMessage,
    cancelRun,
    isRunning,
    setMessages,
  };
};

// Helper functions to convert between formats
export const toAssistantUIMessage = (message: MastraUIMessage) => {
  return {
    role: message.role,
    content: message.parts.map((part) => ({
      type: part.type,
      text: part.text,
    })),
  };
};

export const toAISdkV5Messages = (messages: any[]): MastraUIMessage[] => {
  return messages.map((msg) => ({
    role: msg.role,
    parts: [{ type: "text", text: msg.text || msg.content || "" }],
  }));
};
