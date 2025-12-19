// --- DOMAIN LAYER ---

// Entity: Document
export interface DocumentChunk {
  id: string;
  title: string;      // e.g., "BHMS 1-son"
  content: string;    // The actual text content
  isActive: boolean;
  category: 'BHMS' | 'CODE' | 'OTHER';
  createdAt: number;
}

// Entity: Chat Message
export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

// Value Object: System Configuration
export interface SystemConfig {
  temperature: number;
  systemInstruction: string;
}

// Value Object: Telegram Info
export interface TelegramBotInfo {
  id: number;
  first_name: string;
  username: string;
  can_join_groups: boolean;
}

// UI State (Presentation Layer helper)
export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  BOT_SIMULATOR = 'BOT_SIMULATOR',
  TELEGRAM_CONFIG = 'TELEGRAM_CONFIG',
  API_SETTINGS = 'API_SETTINGS', // Yangi menyu
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}