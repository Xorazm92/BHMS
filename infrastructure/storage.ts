import { DocumentChunk, SystemConfig, ChatMessage } from "../types";
import { BHMS_SEEDS } from "../data/bhmsSeeds";
import { EXTRA_SEEDS } from "../data/extraSeeds";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

// Repository Keys (LocalStorage fallback)
const KEYS = {
  DOCS: 'bhms_docs_v2',
  CONFIG: 'bhms_config_v2',
  CHAT: 'bhms_chat_history_v2',
  AUTH: 'bhms_auth_v2'
};

export class StorageRepository {

  // --- SYSTEM CHECK ---
  static async checkDatabaseStatus(): Promise<'OK' | 'MISSING_TABLES' | 'DISCONNECTED'> {
    if (!isSupabaseConfigured() || !supabase) return 'DISCONNECTED';

    // Oddiy tekshiruv: Documents jadvalini chaqirib ko'ramiz
    const { error } = await supabase.from('documents').select('id').limit(1);

    if (error) {
      // 42P01 - PostgreSQL kodi: "relation does not exist" (Jadval yo'q)
      // Status 404 - PostGrest kodi: Jadvallar hali yaratilmagan bo'lishi mumkin
      if (error.code === '42P01' || (error as any).status === 404) {
        return 'MISSING_TABLES';
      }
      console.error("DB Check Error:", error);
      return 'DISCONNECTED';
    }
    return 'OK';
  }

  // --- DOCUMENTS ---
  static async getDocuments(): Promise<DocumentChunk[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('id', { ascending: true });

      // Improved missing table detection
      if (error) {
        const isMissingTable =
          error.code === '42P01' || // Postgres "relation does not exist"
          error.code === 'PGRST116' || // PostgREST "not found"
          (error as any).status === 404 ||
          error.message?.toLowerCase().includes('not found') ||
          error.message?.toLowerCase().includes('does not exist');

        if (isMissingTable) {
          console.warn("⚠️ Supabase Tables not found. Redirecting to setup...");
          throw new Error("MISSING_TABLES");
        }
      }

      // AVTOMATIK SEEDING (Agar baza bo'sh bo'lsa va jadval mavjud bo'lsa)
      if (!error && (!data || data.length === 0)) {
        console.log("Supabase bo'sh. Ma'lumotlar yuklanmoqda...");
        await this.seedDatabase();
        // Qayta yuklash
        const retry = await supabase.from('documents').select('*').order('id', { ascending: true });
        if (retry.data) {
          return retry.data.map(this.mapSupabaseDoc);
        }
      }

      if (!error && data && data.length > 0) {
        return data.map(this.mapSupabaseDoc);
      }
    }

    // Fallback to LocalStorage
    try {
      const data = localStorage.getItem(KEYS.DOCS);
      return data ? JSON.parse(data) : BHMS_SEEDS;
    } catch {
      return BHMS_SEEDS;
    }
  }

  // Supabase dan kelgan ma'lumotni formatlash
  private static mapSupabaseDoc(d: any): DocumentChunk {
    return {
      id: d.id.toString(),
      title: d.title,
      content: d.content,
      isActive: d.is_active,
      category: d.category as any,
      createdAt: new Date(d.created_at).getTime()
    };
  }

  // Bazani to'ldirish funksiyasi
  static async seedDatabase() {
    if (!supabase) return;

    console.log("Seeding started...");
    const combinedSeeds = [...BHMS_SEEDS, ...EXTRA_SEEDS];

    // ID larni olib tashlaymiz, Supabase o'zi generatsiya qiladi
    const payload = combinedSeeds.map(({ id, ...rest }) => ({
      title: rest.title,
      content: rest.content,
      category: rest.category,
      is_active: rest.isActive
    }));

    const { error } = await supabase.from('documents').insert(payload);
    if (error) console.error("Seeding Error:", error);
    else console.log("✅ Baza muvaffaqiyatli to'ldirildi!");
  }

  static async saveDocument(doc: DocumentChunk): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('documents').insert([{
        title: doc.title,
        content: doc.content,
        category: doc.category,
        is_active: doc.isActive
      }]);
      return;
    }
    // Fallback
    const docs = await this.getDocuments();
    docs.push(doc);
    localStorage.setItem(KEYS.DOCS, JSON.stringify(docs));
  }

  static async deleteDocument(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('documents').delete().eq('id', id);
      return;
    }
    // Fallback
    const docs = await this.getDocuments();
    const newDocs = docs.filter(d => d.id !== id);
    localStorage.setItem(KEYS.DOCS, JSON.stringify(newDocs));
  }

  // --- CONFIG ---
  static getConfig(defaultConfig: SystemConfig): SystemConfig {
    try {
      const data = localStorage.getItem(KEYS.CONFIG);
      return data ? JSON.parse(data) : defaultConfig;
    } catch {
      return defaultConfig;
    }
  }

  static saveConfig(config: SystemConfig): void {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  }

  // --- CHAT HISTORY ---
  static async getChatHistory(): Promise<ChatMessage[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        const isMissingTable =
          error.code === '42P01' || (error as any).status === 404 ||
          error.message?.toLowerCase().includes('not found') ||
          error.message?.toLowerCase().includes('does not exist');
        if (isMissingTable) return [];
      }

      if (data) {
        return data.map((d: any) => ({
          id: d.id.toString(),
          role: d.role,
          text: d.text,
          timestamp: new Date(d.created_at)
        }));
      }
    }
    // Fallback
    try {
      const data = localStorage.getItem(KEYS.CHAT);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async addChatMessage(msg: ChatMessage): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('chat_history').insert([{
        role: msg.role,
        text: msg.text
      }]);
      return;
    }
    // Fallback
    const history = await this.getChatHistory();
    history.push(msg);
    localStorage.setItem(KEYS.CHAT, JSON.stringify(history));
  }

  static async clearChatHistory(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('chat_history').delete().neq('id', 0);
      return;
    }
    localStorage.removeItem(KEYS.CHAT);
  }

  // --- AUTH ---
  static isAuthenticated(): boolean {
    return sessionStorage.getItem(KEYS.AUTH) === 'true';
  }

  static setAuthenticated(status: boolean): void {
    if (status) sessionStorage.setItem(KEYS.AUTH, 'true');
    else sessionStorage.removeItem(KEYS.AUTH);
  }
}