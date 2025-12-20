import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DocumentChunk, SystemConfig, ChatMessage } from "../types";

export class AIService {

  // API Kalitni olish (Faqat Frontend uchun)
  private getApiKey(): string | undefined {
    // 1. Admin panelda kiritilgan kalitni tekshiramiz (LocalStorage)
    const localKey = localStorage.getItem('finlex_gemini_api_key');
    if (localKey && localKey.length > 10) {
      return localKey;
    }
    // 2. Serverdan inject qilingan .env kalitini tekshiramiz
    const envKey = (window as any).process?.env?.GEMINI_API_KEY;
    if (envKey && envKey.length > 10 && !envKey.includes("your_gemini_api_key")) {
      return envKey;
    }
    return undefined;
  }

  private buildPrompt(query: string, context: string, history: ChatMessage[]): string {
    const recentHistory = history.slice(-3).map(msg =>
      `${msg.role === 'user' ? 'FOYDALANUVCHI' : 'AI'}: ${msg.text}`
    ).join("\n");

    return `
SEN: FinLex AI - O'zbekiston Buxgalteriya Hisobi (BHMS) va Moliya huquqi bo'yicha professional maslahatchisan.

---
BILIMLAR BAZASI:
${context}
---

CHAT TARIXI:
${recentHistory}

SAVOL: "${query}"

VAZIFA: Yuqoridagi bilimlar bazasidan foydalanib, savolga aniq javob ber.
`;
  }

  async generateResponse(
    query: string,
    chunks: DocumentChunk[],
    config: SystemConfig,
    history: ChatMessage[] = []
  ): Promise<string> {
    try {
      const apiKey = this.getApiKey();

      if (!apiKey) {
        return "⚠️ **Diqqat:** API Kalit topilmadi. Iltimos, Admin panelning 'Sozlamalar' bo'limiga o'tib, Google Gemini API kalitini kiriting.";
      }

      const client = new GoogleGenAI({ apiKey: apiKey });

      // 1. Retrieval
      const searchTerms = query.toLowerCase().split(' ').filter(w => w.length > 3);
      const activeChunks = chunks.filter(c => {
        if (!c.isActive) return false;
        if (searchTerms.length === 0) return true;
        return searchTerms.some(term =>
          c.title.toLowerCase().includes(term) ||
          c.content.toLowerCase().includes(term)
        );
      });

      const contextText = activeChunks
        .slice(0, 15)
        .map(c => `📗 ${c.title}:\n${c.content}`)
        .join("\n\n");

      if (!contextText) {
        return "⚠️ Tizimda faol hujjatlar mavjud emas yoki savolga aloqador hujjat topilmadi.";
      }

      const prompt = this.buildPrompt(query, contextText, history);

      // 2. Generation
      const response: GenerateContentResponse = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: config.systemInstruction,
          temperature: config.temperature,
        }
      });

      return response.text || "Javob hosil qilinmadi.";

    } catch (error: any) {
      console.error("AI Error:", error);
      if (error.message?.includes("400") || error.message?.includes("API key")) {
        return "🚫 **API Kalit Xatosi**: Kiritilgan kalit noto'g'ri. Sozlamalar bo'limidan yangilang.";
      }
      return `🚫 **Xatolik**: ${error.message}`;
    }
  }
}

export const aiService = new AIService();