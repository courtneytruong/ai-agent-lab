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
    new DynamicTool({
      name: "reverse_string",
      description: "Reverses a string. Input should be a single string.",
      func: async (input) => {
        if (typeof input !== "string") return "Input must be a string.";
        return input.split("").reverse().join("");
      },
    }),
  ];

  // Create agent using LangChain's createAgent
  const { createAgent } = await import("langchain");
  const agent = createAgent({
    model: chatModel,
    tools,
  });

  // Array of test queries
  const testQueries = [
    "What time is it right now?",
    "What is 25 * 4 + 10?",
    "Reverse the string 'Hello World'",
  ];

  console.log("\nRunning example queries:\n");
  for (const query of testQueries) {
    console.log("\n" + "─".repeat(50));
    console.log(`Query: ${query}`);
    try {
      const result = await agent.invoke({
        messages: [{ role: "user", content: query }],
      });
      const messages = result.messages || [];
      const finalMessage = messages
        .reverse()
        .find((m) => m.constructor?.name === "AIMessage" && m.content);
      if (finalMessage) {
        console.log("✅ Result:", finalMessage.content);
      } else {
        console.log("❌ No result returned by agent.");
      }
    } catch (err) {
      console.error("❌ Error for query:", query, err);
    }
    console.log("─".repeat(50) + "\n");
  }
  console.log("All example queries completed.\n");
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
