import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) { console.error("No Key"); return; }

    // Custom fetch to list models since the SDK helper might abstract errors
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.error("❌ No models found or error:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Network Error:", error.message);
    }
}

listModels();
