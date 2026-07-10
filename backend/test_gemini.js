const geminiService = require('./services/geminiService');
require('dotenv').config();

async function test() {
  console.log("Testing chatWithCareerCoach...");
  try {
    const result = await geminiService.chatWithCareerCoach("What is node.js?", [{ role: "user", content: "Review standard negotiation strategies" }]);
    console.log("Success:", result);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
