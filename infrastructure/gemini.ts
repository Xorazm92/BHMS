import { DocumentChunk, SystemConfig, ChatMessage } from "../types";

export class AIService {

  async generateResponse(
    query: string,
    chunks: DocumentChunk[],
    config: SystemConfig,
    history: ChatMessage[] = [],
    selectedCategory: string = 'ALL'
  ): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          category: selectedCategory,
          history: history.slice(-5).map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error');
      }

      const data = await response.json();
      return data.response || "Javob hosil qilinmadi.";

    } catch (error: any) {
      console.error("AI Error:", error);
      return `🚫 **Xatolik**: ${error.message}`;
    }
  }
}

export const aiService = new AIService();