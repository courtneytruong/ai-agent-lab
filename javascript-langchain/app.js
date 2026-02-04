import dotenv from "dotenv";
// import { createAgent } from "langchain";
import { Calculator } from "@langchain/community/tools/calculator";
import { DynamicTool } from "@langchain/core/tools";
dotenv.config();

async function main() {
  // ...existing code...
  // Check for GITHUB_TOKEN
  if (!process.env.GITHUB_TOKEN) {
    console.error(
      "❌ GITHUB_TOKEN not found in environment variables!\n\nPlease create a .env file in the project root with the following content:\n\nGITHUB_TOKEN=your_github_token_here\n\n🔑 You can generate a token at: https://github.com/settings/tokens\n",
    );
    process.exit(1);
  }
  const token = process.env["GITHUB_TOKEN"];

  // Create ChatOpenAI instance for GitHub Models
  const { ChatOpenAI } = await import("@langchain/openai");
  const chatModel = new ChatOpenAI({
    model: "openai/gpt-4o",
    temperature: 0,
    apiKey: token,
    configuration: {
      baseURL: "https://models.github.ai/inference",
    },
  });
  console.log("🚀 Starting LangChain AI Agent...");

  // Create tools array with Calculator and DynamicTool for current time
  const tools = [
    new Calculator(),
    new DynamicTool({
      name: "get_current_time",
      description: "Returns the current date and time as a string.",
      func: async () => new Date().toString(),
    }),
  ];

  // Create agent using LangChain's createAgent
  const { createAgent } = await import("langchain");
  const agent = createAgent({
    model: chatModel,
    tools,
  });

  // Test queries using agent
  try {
    // Math query
    const mathResult = await agent.invoke({
      messages: [{ role: "user", content: "What is 25 * 4 + 10?" }],
    });
    // Print only the final AIMessage content
    const mathMessages = mathResult.messages || [];
    const finalMathMessage = mathMessages
      .reverse()
      .find((m) => m.constructor?.name === "AIMessage" && m.content);
    if (finalMathMessage) {
      console.log(finalMathMessage.content);
    }

    // Time query
    const timeResult = await agent.invoke({
      messages: [{ role: "user", content: "What time is it right now?" }],
    });
    const timeMessages = timeResult.messages || [];
    const finalTimeMessage = timeMessages
      .reverse()
      .find((m) => m.constructor?.name === "AIMessage" && m.content);
    if (finalTimeMessage) {
      console.log(finalTimeMessage.content);
    }
  } catch (err) {
    console.error("Agent encountered an error:", err);
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
