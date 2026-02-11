import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { askLocationTool } from "../tools/ask-location-tool";
import { fetchWeatherTool } from "../tools/fetch-weather-tool";

export const weatherAgent = new Agent({
  id: "weather-agent",
  name: "Weather Agent",
  instructions: `
    You are a helpful weather assistant.

    - If the user does not provide a location, use askLocationTool to ask for a city.
    - Once you know the city, use fetchWeatherTool to fetch the weather for that city.
  `,
  model: "openai/gpt-4.1-mini",
  tools: {
    askLocationTool,
    fetchWeatherTool,
  },
  memory: new Memory({
    options: {
      lastMessages: 10,
    },
  }),
  defaultOptions: {
    // Enable automatic resumption of the suspendable tool
    autoResumeSuspendedTools: true,
  },
});
