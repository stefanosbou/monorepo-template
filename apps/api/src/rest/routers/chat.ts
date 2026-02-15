import type { Context } from "@api/rest/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
  createUIMessageStreamResponse,
  handleChatStream,
  mastra,
  toAISdkV5Messages,
} from "@humblebrag/ai/mastra/server";

import { withRequiredScope } from "../middleware";

const app = new OpenAPIHono<Context>();

const THREAD_ID = "example-user-id";
const RESOURCE_ID = "default";

app.post("/", withRequiredScope("chat.write"), async (c) => {
  const params = await c.req.json();

  const stream = await handleChatStream({
    mastra,
    agentId: "profile-agent",
    params: {
      ...params,
      memory: {
        thread: THREAD_ID,
        resource: RESOURCE_ID,
      },
      autoResumeSuspendedTools: true,
    },
  });
  return createUIMessageStreamResponse({ stream });
});

app.get("/", withRequiredScope("chat.read"), async (c) => {
  // Placeholder for fetching past messages - in a real implementation, you'd query your database here
  const memory = await mastra.getAgentById("profile-agent").getMemory();
  let response = null;

  try {
    response = await memory?.recall({
      threadId: THREAD_ID,
      resourceId: RESOURCE_ID,
    });
  } catch {
    console.log("No previous messages found.");
  }

  const uiMessages = toAISdkV5Messages(response?.messages || []);

  return c.json(uiMessages);
});

export const chatRouter = app;
