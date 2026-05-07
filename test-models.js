require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // This will verify your connection and list available models
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Checking available models...');

    // Note: The SDK doesn't always have a direct 'listModels' helper exposed simply,
    // but if this script fails with 404, we know the KEY is valid but model is wrong.
    // If it fails with 403/400, the KEY is wrong.

    const result = await model.generateContent('Hello');
    console.log("Success! 'gemini-pro' works.");
    console.log(result.response.text());
  } catch (error) {
    console.error('Error details:', error.message);
  }
}

listModels();
