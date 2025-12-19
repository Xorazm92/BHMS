import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DocumentChunk, SystemConfig } from "../types";

export const generateRAGResponse = async (
  query: string,
  chunks: DocumentChunk[],
  config: SystemConfig
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 1. Retrieval Step: Sort by relevance (simulated) or just take active chunks
    const activeContext = chunks
      .filter(c => c.isActive)
      .map(c => `📄 MANBA: ${c.title}\nMATN: ${c.content}`)
      .join("\n\n---\n\n");

    if (!activeContext.trim()) {
      return "📭 **Ma'lumot topilmadi**\n\nBilimlar bazasi bo'sh. Iltimos, Admin panel orqali BHMS hujjatlarini yuklang.";
    }

    // 2. Augmentation Step: Strict Expert Persona
    const prompt = `
SEN: O'zbekiston Respublikasi Buxgalteriya Hisobi (BHMS) bo'yicha eng kuchli mutaxassis va yurist-konsultantsan.
VAZIFA: Foydalanuvchi savoliga FAQAT pastda keltirilgan "BILIMLAR BAZASI"dagi ma'lumotlarga asoslanib javob berish.

---
BILIMLAR BAZASI:
${activeContext}
---

FOYDALANUVCHI SAVOLI: "${query}"

QAT'IY QOIDALAR:
1. Javobingiz aniq Telegram xabari uslubida bo'lsin (qisqa paragraflar, emoji).
2. Javobdagi eng muhim so'zlar yoki raqamlarni **qalin** qilib belgilang.
3. Agar savolga javob bazada bo'lmasa, "Kechirasiz, taqdim etilgan BHMS hujjatlarida bu bo'yicha ma'lumot topilmadi" deb ayting. O'zingizdan to'qimang.
4. Javobingizni huquqiy va rasmiy tilda, lekin tushunarli qilib yozing.
5. Har bir faktga manba keltiring (Masalan: _(BHMS 1-son, 5-band)_).
`;

    // 3. Generation Step
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature,
      }
    });

    return response.text || "Javob bo'sh qaytdi.";

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `🚫 **Xatolik yuz berdi**: ${error.message}`;
  }
};