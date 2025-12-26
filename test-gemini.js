import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Testing Key:", key ? key.slice(0, 5) + "..." : "MISSING");

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Hello!");
        console.log("✅ Success! Response:", result.response.text());
    } catch (error) {
        console.error("❌ API Error:", error.message);
    }
}

test();
