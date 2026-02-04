import dotenv from "dotenv";
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
  // Your code will go here
}

main().catch(console.error);
