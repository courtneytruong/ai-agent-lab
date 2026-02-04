import dotenv from "dotenv";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { Calculator } from "@langchain/community/tools/calculator";
import { DynamicTool } from "@langchain/core/tools";
dotenv.config();

async function main() {
  console.log("🚀 Starting LangChain AI Agent...");

  // Check for GITHUB_TOKEN
  if (!process.env.GITHUB_TOKEN) {
    console.error(
      "❌ GITHUB_TOKEN not found in environment variables!\n\nPlease create a .env file in the project root with the following content:\n\nGITHUB_TOKEN=your_github_token_here\n\n🔑 You can generate a token at: https://github.com/settings/tokens\n",
    );
    process.exit(1);
  }
  console.log("✅ GITHUB_TOKEN found! Ready to proceed.");
  // Use OpenAI client for GitHub Models
  const OpenAI = (await import("openai")).default;
  const token = process.env["GITHUB_TOKEN"];

  const client = new OpenAI({
    baseURL: "https://models.github.ai/inference",
    apiKey: token,
  });

  // Create tools array with Calculator
  const tools = [new Calculator()];

  // Create agent executor
  const executor = await initializeAgentExecutorWithOptions(tools, client, {
    agentType: "openai-functions",
    verbose: true,
  });

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "" },
      { role: "user", content: "What is 25 * 4 + 10?" },
    ],
    model: "openai/gpt-4o",
    temperature: 0,
    max_tokens: 4096,
    top_p: 1,
  });

  console.log("📝 AI Response:", response.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
