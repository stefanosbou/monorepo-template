"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";

export const MyRuntimeProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "http://localhost:4750/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};
