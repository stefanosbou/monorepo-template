import { chatRoute } from "@mastra/ai-sdk";
import { Mastra } from "@mastra/core";
import { profileAgent } from "./agents/profile-agent";
import { weatherAgent } from "./agents/weather-agent";
import { storage } from "./storage";

const agents = {
  weatherAgent,
  profileAgent,
};

export type AgentName = keyof typeof agents;

export const mastra = new Mastra({
  agents,
  storage: storage,
  // server: {
  //   // Use a non-default port to avoid conflicts with other Mastra servers running locally
  //   port: 4750,
  //   cors: {
  //     origin: "*",
  //     allowMethods: ["*"],
  //     allowHeaders: ["*"],
  //   },
  //   apiRoutes: [
  //     chatRoute({
  //       path: "/chat",
  //       agent: "weatherAgent",
  //     }),
  //   ],
  // },
});

export { handleChatStream, toAISdkStream } from "@mastra/ai-sdk";
export { toAISdkV5Messages } from "@mastra/ai-sdk/ui";
export { createUIMessageStreamResponse, smoothStream } from "ai";
