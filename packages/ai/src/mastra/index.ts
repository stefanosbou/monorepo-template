// Client-safe exports only - no Node.js dependencies
// For server-side code, import from @humblebrag/ai/mastra/server
export {
  DefaultChatTransport,
  type ToolUIPart,
  type UIMessage,
  type UITools,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
export type { UIDataTypes } from "ai";
