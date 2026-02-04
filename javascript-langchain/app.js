import dotenv from "dotenv";
// import { initializeAgentExecutorWithOptions } from "langchain/agents";
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
  // Create tools array with Calculator
  // const tools = [new Calculator()];

  // Create OpenAI client for GitHub Models
  const token = process.env["GITHUB_TOKEN"];
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({
    baseURL: "https://models.github.ai/inference",
    apiKey: token,
  });

  // Test query using OpenAI client (GitHub model)
  const testQuery = "What time is it right now?";
  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "" },
        { role: "user", content: testQuery },
      ],
      model: "openai/gpt-4o",
      temperature: 0,
    });
    // Print only the result of the test query
    const result = response.choices?.[0]?.message?.content;
    console.log(result);
  } catch (err) {
    console.error("Agent encountered an error:", err);
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
