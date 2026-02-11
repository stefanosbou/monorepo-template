import type { Context } from "@api/rest/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { weatherAgent } from "@humblebrag/ai/agents/weather-agent";
import {
  createUIMessageStreamResponse,
  handleChatStream,
  mastra,
  toAISdkStream,
  toAISdkV5Messages,
} from "@humblebrag/ai/mastra/server";

import { withRequiredScope } from "../middleware";

const app = new OpenAPIHono<Context>();

const THREAD_ID = "example-user-id";
const RESOURCE_ID = "weather-chat";

app.post("/", withRequiredScope("chat.write"), async (c) => {
  const params = await c.req.json();

  const stream = await handleChatStream({
    mastra,
    agentId: "weather-agent",
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

  // const currentMessages = params.messages || [];
  // const isToolResponse = params.toolResponse || false;

  // const { userInputResponse } = params;

  // const modifiedParams = {
  //   memory: {
  //     thread: THREAD_ID,
  //     resource: RESOURCE_ID,
  //   },
  //   autoResumeSuspendedTools: true,
  // };

  // // if (userInputResponse) {
  // //   const { value } = userInputResponse;

  // //   modifiedParams = {
  // //     ...modifiedParams,
  // //     autoResumeSuspendedTools: true,
  // //     messages: [
  // //       ...currentMessages,
  // //       {
  // //         role: "user",
  // //         content: value,
  // //       },
  // //     ],
  // //   };
  // // }

  // // console.log("Params memory:", modifiedParams.memory);
  // // console.log(
  // //   "Params messages:",
  // //   JSON.stringify(modifiedParams.messages, null, 2),
  // // );

  // // console.log("autoResume:", modifiedParams.autoResumeSuspendedTools);

  // const agent = mastra.getAgentById("weather-agent");
  // const memory = await agent.getMemory();
  // let response = null;

  // try {
  //   response = await memory?.recall({
  //     threadId: THREAD_ID,
  //     resourceId: RESOURCE_ID,
  //   });
  // } catch {
  //   console.log("No previous messages found.");
  // }

  // // console.log(
  // //   "Recalled memory messages:",
  // //   JSON.stringify(response?.messages, null, 2),
  // // );

  // // get the last message
  // const message = params.messages.slice(-1)[0];

  // console.log(
  //   "Current messages sent to agent:",
  //   JSON.stringify(message, null, 2),
  // );

  // let stream: any;

  // if (isToolResponse) {
  //   stream = await agent.resumeStream(message, {
  //     ...modifiedParams,
  //   });
  // } else {
  //   stream = await agent.stream(message, {
  //     ...modifiedParams,
  //   });
  // }

  // const stream = await handleChatStream({
  //   mastra,
  //   agentId: "weather-agent",
  //   params: modifiedParams,
  // });
  // return createUIMessageStreamResponse({ stream });

  // return createUIMessageStreamResponse({
  //   stream: toAISdkStream(stream, { from: "agent" }),
  // });

  // const body = await c.req.json();
  // const validationResult = chatRequestSchema.safeParse(body);
  // if (!validationResult.success) {
  //   return c.json({ success: false, error: validationResult.error }, 400);
  // }
  // const {
  //   message,
  //   id,
  //   timezone,
  //   agentChoice,
  //   toolChoice,
  //   country,
  //   city,
  //   metricsFilter,
  // } = validationResult.data;
  // const teamId = c.get("teamId");
  // const session = c.get("session");
  // const userId = session.user.id;
  // const db = c.get("db");
  // const userContext = await getUserContext({
  //   db,
  //   userId,
  //   teamId,
  //   country,
  //   city,
  //   timezone,
  // });
  // // Extract forced tool params from message metadata (widget clicks)
  // // When a widget sends toolParams, use them directly (bypasses AI decisions)
  // let forcedToolCall: ForcedToolCall | undefined;
  // const metadata = (message as any)?.metadata;
  // if (metadata?.toolCall?.toolName && metadata?.toolCall?.toolParams) {
  //   forcedToolCall = {
  //     toolName: metadata.toolCall.toolName,
  //     toolParams: metadata.toolCall.toolParams,
  //   };
  // }
  // const appContext = buildAppContext(userContext, id, {
  //   metricsFilter: metricsFilter as MetricsFilter | undefined,
  //   forcedToolCall,
  // });
  // // Pass user preferences to main agent as context
  // // The main agent will use this information to make better routing decisions
  // return weatherAgent.toUIMessageStream({
  //   message,
  //   strategy: "auto",
  //   maxRounds: 5,
  //   maxSteps: 20,
  //   context: appContext,
  //   agentChoice,
  //   toolChoice,
  //   experimental_transform: smoothStream({
  //     chunking: "word",
  //   }),
  //   sendSources: true,
  // });
});

app.get("/", withRequiredScope("chat.read"), async (c) => {
  // Placeholder for fetching past messages - in a real implementation, you'd query your database here
  const memory = await mastra.getAgentById("weather-agent").getMemory();
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
