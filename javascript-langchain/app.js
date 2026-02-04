import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
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
  // Create ChatOpenAI instance
  const chat = new ChatOpenAI({
    model: "openai/gpt-4o",
    temperature: 0,
    baseURL: "https://models.github.ai/inference",
    apiKey: process.env.GITHUB_TOKEN,
  });

  console.log("🤖 ChatOpenAI instance created and ready.");
}

main().catch(console.error);
