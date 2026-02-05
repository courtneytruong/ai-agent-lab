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
    new DynamicTool({
      name: "get_weather",
      description:
        "Returns the weather for a given date. Accepts a date parameter formatted as 'yyyy-MM-dd'. Returns 'Sunny, 72°F' if the date matches today's date, otherwise returns 'Rainy, 55°F'. Always use get_current_time to determine today's date before calling this tool. The agent should first call get_current_time to get today's date, then call get_weather with that date, and finally return a complete answer combining both pieces of information.",
      func: async (input) => {
        // input should be a string in 'yyyy-MM-dd' format
        if (typeof input !== "string") {
          return "Input must be a date string in 'yyyy-MM-dd' format.";
        }
        // Get today's date in yyyy-MM-dd format
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const todayStr = `${yyyy}-${mm}-${dd}`;
        if (input === todayStr) {
          return `Sunny, 72°F`;
        } else {
          return `Rainy, 55°F`;
        }
      },
    }),
  ];

  // System message to instruct the AI
  const systemMessage = {
    role: "system",
    content:
      "You are a professional and succinct AI assistant. Always answer clearly and concisely.\n\nFor weather queries, always first call the get_current_time tool to get today's date (in string format), then call get_weather with that date (formatted as yyyy-MM-dd), and return a complete answer that combines both the date and the weather result.",
  };

  // Create agent using LangChain's createAgent
  const { createAgent } = await import("langchain");
  const agent = createAgent({
    model: chatModel,
    tools,
    systemMessage,
  });

  // Array of test queries
  const testQueries = [
    "What time is it right now?",
    "What is 25 * 4 + 10?",
    "Reverse the string 'Hello World'",
    "What's the weather like today?",
  ];

  console.log("\nRunning example queries:\n");
  for (const query of testQueries) {
    console.log("\n" + "─".repeat(50));
    console.log(`Query: ${query}`);
    try {
      const result = await agent.invoke({
        messages: [systemMessage, { role: "user", content: query }],
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
