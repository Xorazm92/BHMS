import React, { useState, useEffect, useRef } from 'react';
import {
  ViewState, DocumentChunk, ChatMessage, SystemConfig,
  TelegramBotInfo, ToastNotification
} from './types';
import { StorageRepository } from './infrastructure/storage';
import { aiService } from './infrastructure/gemini';
import {
  LayoutDashboard, Database, MessageSquare,
  Trash2, FileText, Send, Bot,
  RefreshCw, LogOut, Smartphone,
  ShieldCheck, Search, ChevronRight, UploadCloud, CheckCircle2,
  Server, Copy, Terminal, User, ArrowRight, BookOpen, ExternalLink, Lock,
  Mic, MicOff, Zap, Loader2, AlertTriangle, Settings, Key
} from 'lucide-react';
import { isSupabaseConfigured } from './infrastructure/supabaseClient';
import { SUPABASE_SCHEMA_SQL } from './data/schema';

// --- CONSTANTS ---
// Bu token faqat frontendda ma'lumot olish uchun (getMe). Bot aslida server.js da ishlaydi.
const TELEGRAM_BOT_TOKEN = "8574437707:AAGsyX3ipeEevEcAq6EM1hy1cw_VVHr_sGk";
const DEFAULT_SYSTEM_INSTRUCTION = "Sen FinLex AI - Moliya va Buxgalteriya bo'yicha professional maslahatchisan. Javoblaring aniq, qonuniy asoslangan (BHMS va Soliq kodeksi) va muloyim bo'lsin.";
const ADMIN_PASSWORD = "admin";

// --- COMPONENTS PROPS INTERFACES ---
type ClientInterfaceProps = {
  documents: DocumentChunk[];
  config: SystemConfig;
  onSwitchToAdmin: () => void;
};

type AdminDashboardProps = {
  documents: DocumentChunk[];
  refreshDocuments: () => Promise<void>;
  config: SystemConfig;
  setConfig: (c: SystemConfig) => void;
  onLogout: () => void;
  toasts: ToastNotification[];
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  isLoadingDocs: boolean;
};

type AdminLoginProps = {
  onLogin: () => void;
  onBack: () => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
};

// --- BRANDING ASSETS ---
const FinLexLogo = ({ className = "w-10 h-10", dark = false }: { className?: string, dark?: boolean }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="finlexGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <path d="M50 92C50 92 85 78 85 45V20L50 8L15 20V45C15 78 50 92 50 92Z" fill="url(#finlexGradient)" stroke={dark ? "white" : "none"} strokeWidth="2" />
    <path d="M40 35H65M40 50H60" stroke="white" strokeWidth="6" strokeLinecap="round" />
    <path d="M50 62L54 72L64 76L54 80L50 90L46 80L36 76L46 72L50 62Z" fill="white" />
  </svg>
);

// --- UTILS ---
const FormatText = ({ text, isUser }: { text: string, isUser?: boolean }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\n- .*|\n\d+\. .*)/g);
  return (
    <span className={`whitespace-pre-wrap leading-relaxed ${isUser ? 'text-white' : 'text-slate-700'}`}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className={isUser ? 'font-bold text-white' : 'font-bold text-slate-900'}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className={`px-1.5 py-0.5 rounded font-mono text-xs ${isUser ? 'bg-white/20' : 'bg-slate-100 text-pink-500 border border-slate-200'}`}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('\n- ')) {
          return <div key={i} className="pl-4 py-1 flex items-start gap-2"><span className="text-blue-500 mt-1.5 text-[6px] ●">●</span><span>{part.slice(3)}</span></div>
        }
        if (part.match(/^\n\d+\. /)) {
          const match = part.match(/^\n(\d+)\. (.*)/);
          if (match) return <div key={i} className="pl-4 py-1 font-semibold text-slate-800">{match[1]}. <span className="font-normal text-slate-700">{match[2]}</span></div>
        }
        return part;
      })}
    </span>
  );
};

// --- APP ROOT ---
const App: React.FC = () => {
  const [appMode, setAppMode] = useState<'CLIENT' | 'ADMIN' | 'LOGIN' | 'SETUP_DB'>('CLIENT');
  const [documents, setDocuments] = useState<DocumentChunk[]>([]);
  const [config, setConfig] = useState<SystemConfig>({ temperature: 0.3, systemInstruction: DEFAULT_SYSTEM_INSTRUCTION });
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Initialize Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingDocs(true);
      try {
        const docs = await StorageRepository.getDocuments();
        setDocuments(docs);
        setConfig(StorageRepository.getConfig({ temperature: 0.3, systemInstruction: DEFAULT_SYSTEM_INSTRUCTION }));
        setIsLoadingDocs(false);
      } catch (e: any) {
        if (e.message === 'MISSING_TABLES') {
          setAppMode('SETUP_DB');
        } else {
          addToast("Ma'lumotlarni yuklashda xatolik", "error");
        }
        setIsLoadingDocs(false);
      }

      if (!isSupabaseConfigured()) {
        addToast("Supabase ulanmagan. LocalStorage ishlatilmoqda.", "info");
      }
    };
    fetchData();
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const refreshDocuments = async () => {
    try {
      const docs = await StorageRepository.getDocuments();
      setDocuments(docs);
    } catch (e: any) {
      if (e.message === 'MISSING_TABLES') setAppMode('SETUP_DB');
    }
  };

  if (appMode === 'SETUP_DB') {
    return <DatabaseSetupScreen onRetry={() => window.location.reload()} />;
  }

  if (appMode === 'CLIENT') {
    return (
      <ClientInterface
        documents={documents}
        config={config}
        onSwitchToAdmin={() => setAppMode('LOGIN')}
      />
    );
  }

  if (appMode === 'LOGIN') {
    return (
      <AdminLogin
        onLogin={() => setAppMode('ADMIN')}
        onBack={() => setAppMode('CLIENT')}
        addToast={addToast}
      />
    );
  }

  return (
    <AdminDashboard
      documents={documents}
      refreshDocuments={refreshDocuments}
      config={config}
      setConfig={setConfig}
      onLogout={() => {
        StorageRepository.setAuthenticated(false);
        setAppMode('CLIENT');
      }}
      toasts={toasts}
      addToast={addToast}
      isLoadingDocs={isLoadingDocs}
    />
  );
};

// ==========================================
// 0. DB SETUP SCREEN
// ==========================================
const DatabaseSetupScreen = ({ onRetry }: { onRetry: () => void }) => {
  const copySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    alert("SQL kod nusxalandi! Endi Supabase SQL Editorga tashlang.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
          <FinLexLogo className="w-8 h-8" />
          <h1 className="text-white font-bold text-lg">FinLex AI: Tizimni Sozlash</h1>
        </div>
        <div className="p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 text-yellow-800 mb-6">
            <AlertTriangle className="shrink-0" />
            <div>
              <h4 className="font-bold">Ma'lumotlar bazasi topilmadi</h4>
              <p className="text-sm mt-1">Supabase muvaffaqiyatli ulandi, lekin jadvallar yaratilmagan.</p>
            </div>
          </div>
          <div className="relative mb-6 group">
            <div className="absolute top-3 right-3">
              <button onClick={copySQL} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md">
                <Copy size={14} /> Nusxalash
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-300 p-5 rounded-xl text-xs font-mono overflow-x-auto h-48">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
          <div className="flex gap-4">
            <a
              href="https://supabase.com/dashboard/project/_/sql/new"
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all"
            >
              <ExternalLink size={18} /> SQL Editorga o'tish
            </a>
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
            >
              <RefreshCw size={18} /> Tekshirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 1. CLIENT INTERFACE
// ==========================================
const ClientInterface: React.FC<ClientInterfaceProps> = ({ documents, config, onSwitchToAdmin }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Brauzeringiz ovozli yozishni qo'llab-quvvatlamaydi.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'uz-UZ';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      StorageRepository.addChatMessage(userMsg);
      const response = await aiService.generateResponse(text, documents, config, messages);
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
      StorageRepository.addChatMessage(botMsg);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Aloqa uzildi. Iltimos, qayta urinib ko'ring.", timestamp: new Date(), isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 z-50 glass-panel">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FinLexLogo className="w-10 h-10 shadow-lg rounded-xl" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1">FinLex<span className="text-blue-600">AI</span></h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-wide uppercase">Buxgalteriya Eksperti</p>
            </div>
          </div>
          <button onClick={onSwitchToAdmin} className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm hover:shadow">
            <Lock size={12} className="text-slate-400 group-hover:text-blue-500" /> Admin
          </button>
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:pt-8 pb-36">
        {messages.length === 0 ? (
          <div className="mt-8 md:mt-16 text-center animate-slide-up space-y-8 px-4">
            <div className="relative inline-block group cursor-default">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000 animate-pulse"></div>
              <FinLexLogo className="w-28 h-28 relative z-10 drop-shadow-2xl" />
            </div>
            <div className="space-y-3 max-w-lg mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">FinLex AI ga xush kelibsiz</h2>
              <p className="text-slate-500 text-lg leading-relaxed">O'zbekiston qonunchiligi va BHMS standartlari asosida ishlaydigan professional yordamchi.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 mt-1 shadow-sm overflow-hidden"><FinLexLogo className="w-6 h-6" /></div>}
                <div className={`max-w-[90%] md:max-w-2xl p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-200' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'}`}>
                  <FormatText text={msg.text} isUser={msg.role === 'user'} />
                </div>
              </div>
            ))}
            {isTyping && <div className="flex gap-4"><div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 mt-1 shadow-sm"><FinLexLogo className="w-6 h-6" /></div><div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></span><span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></span></div></div>}
            <div ref={scrollRef} />
          </div>
        )}
      </main>
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent z-40">
        <div className="max-w-3xl mx-auto">
          <div className={`relative glass-input rounded-2xl flex items-center p-2 transition-all duration-300 ${isListening ? 'ring-4 ring-red-500/20 border-red-500' : 'focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400'}`}>
            <button onClick={toggleVoiceInput} className={`p-3 rounded-xl transition-all mr-2 ${isListening ? 'bg-red-500 text-white animate-pulse-ring' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>{isListening ? <MicOff size={20} /> : <Mic size={20} />}</button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend(input)} placeholder={isListening ? "Eshitayapman..." : "Savolingizni yozing..."} disabled={isTyping} className="flex-1 bg-transparent border-none outline-none py-3.5 text-[15px] text-slate-900 placeholder-slate-400" />
            <button onClick={() => handleSend(input)} disabled={!input.trim() || isTyping} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center shadow-lg shadow-blue-200"><Send size={20} className={!input.trim() ? "opacity-70" : ""} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. ADMIN LOGIN
// ==========================================
const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack, addToast }) => {
  const [password, setPassword] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      StorageRepository.setAuthenticated(true);
      onLogin();
      addToast("Xush kelibsiz!");
    } else {
      addToast("Parol noto'g'ri", 'error');
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200 border border-white w-full max-w-md animate-in zoom-in-95 duration-500 relative overflow-hidden">
        <div className="relative text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-slate-200 border border-slate-50"><FinLexLogo className="w-14 h-14" /></div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FinLex Admin</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-11 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium text-slate-800" placeholder="••••••••" autoFocus />
          </div>
          <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-slate-200">Kirish</button>
          <button type="button" onClick={onBack} className="w-full text-slate-500 py-2 text-xs font-semibold hover:text-blue-600 transition-colors flex items-center justify-center gap-1"><ArrowRight size={12} className="rotate-180" /> Ortga qaytish</button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. ADMIN DASHBOARD
// ==========================================
const AdminDashboard: React.FC<AdminDashboardProps> = ({ documents, refreshDocuments, config, setConfig, onLogout, toasts, addToast, isLoadingDocs }) => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [botInfo, setBotInfo] = useState<TelegramBotInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [simInput, setSimInput] = useState('');
  const [isSimTyping, setIsSimTyping] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('finlex_gemini_api_key') || (window as any).process?.env?.GEMINI_API_KEY || '');
  const simEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`).then(res => res.json()).then(data => data.ok && setBotInfo(data.result)).catch(() => console.warn("Telegram fetch skipped"));
    StorageRepository.getChatHistory().then(setChatHistory);
  }, []);

  useEffect(() => { if (currentView === ViewState.BOT_SIMULATOR) simEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, currentView]);

  const handleSimSend = async () => {
    if (!simInput.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: simInput, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setSimInput('');
    setIsSimTyping(true);
    StorageRepository.addChatMessage(userMsg);
    try {
      const response = await aiService.generateResponse(userMsg.text, documents, config, chatHistory);
      const botMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: response, timestamp: new Date() };
      setChatHistory(prev => [...prev, botMsg]);
      StorageRepository.addChatMessage(botMsg);
    } catch { addToast("AI Xatolik", "error"); } finally { setIsSimTyping(false); }
  };

  const handleSaveApiKey = () => {
    if (apiKey.length < 10) {
      addToast("API Kalit juda qisqa", "error");
      return;
    }
    localStorage.setItem('finlex_gemini_api_key', apiKey);
    addToast("API Kalit saqlandi!", "success");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { addToast("Fayl hajmi 2MB dan oshmasligi kerak", "error"); return; }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const newDoc: DocumentChunk = {
          id: Date.now().toString(),
          title: file.name,
          content: text.slice(0, 50000),
          isActive: true,
          category: 'OTHER',
          createdAt: Date.now()
        };
        await StorageRepository.saveDocument(newDoc);
        await refreshDocuments();
        addToast(`${file.name} yuklandi`);
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  const deleteDoc = async (id: string) => {
    if (confirm("Haqiqatan ham o'chirmoqchimisiz?")) {
      await StorageRepository.deleteDocument(id);
      await refreshDocuments();
      addToast("Hujjat o'chirildi");
    }
  };

  const filteredDocs = documents.filter((d: DocumentChunk) => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans text-slate-900">
      <aside className="hidden md:flex w-72 bg-[#1E293B] text-white flex-col fixed h-full z-20 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8"><FinLexLogo className="w-10 h-10" /><div><span className="font-bold text-lg block leading-none tracking-tight">FinLex<span className="text-blue-400">AI</span></span><span className="text-xs text-slate-400 font-medium">Admin Panel v2.0</span></div></div>
          <nav className="space-y-1.5">
            <AdminSidebarItem view={ViewState.DASHBOARD} current={currentView} set={setCurrentView} icon={LayoutDashboard} label="Statistika" />
            <AdminSidebarItem view={ViewState.KNOWLEDGE_BASE} current={currentView} set={setCurrentView} icon={Database} label="Bilimlar Bazasi" />
            <AdminSidebarItem view={ViewState.BOT_SIMULATOR} current={currentView} set={setCurrentView} icon={MessageSquare} label="Simulator" />
            <AdminSidebarItem view={ViewState.API_SETTINGS} current={currentView} set={setCurrentView} icon={Settings} label="Sozlamalar" />
            <AdminSidebarItem view={ViewState.TELEGRAM_CONFIG} current={currentView} set={setCurrentView} icon={Server} label="Server & Deploy" />
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-700/50"><button onClick={onLogout} className="flex w-full items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-700/50 p-3 rounded-xl transition-all"><LogOut size={18} /> <span className="font-medium text-sm">Chiqish</span></button></div>
      </aside>
      <main className="flex-1 md:ml-72 p-8 overflow-y-auto h-screen bg-[#F1F5F9]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="md:hidden flex justify-between items-center mb-6"><div className="flex items-center gap-2"><FinLexLogo className="w-8 h-8" /><h1 className="font-bold text-xl text-slate-900">FinLex Admin</h1></div><button onClick={onLogout}><LogOut size={20} /></button></div>

          {currentView === ViewState.DASHBOARD && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-800">Umumiy Statistika</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Jami Hujjatlar" value={documents.length} icon={FileText} color="blue" />
                <StatCard label="Telegram Bot" value={botInfo ? "Active" : "Checking"} icon={Smartphone} color={botInfo ? "green" : "yellow"} />
                <StatCard label="Database" value={isSupabaseConfigured() ? "Supabase Cloud" : "Local Storage"} icon={Database} color="purple" />
              </div>
            </div>
          )}

          {currentView === ViewState.KNOWLEDGE_BASE && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col animate-in fade-in duration-500">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input type="text" placeholder="Qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>
                <div className="relative">
                  <button disabled={isLoadingDocs} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200 disabled:opacity-50">
                    {isLoadingDocs ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />} <span>Yuklash (.txt, .md)</span>
                  </button>
                  <input type="file" accept=".txt,.md,.json,.csv" className="absolute inset-0 opacity-0 cursor-pointer w-full" onChange={handleFileUpload} disabled={isLoadingDocs} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoadingDocs ? <div className="flex justify-center items-center h-40 text-slate-400"><Loader2 className="animate-spin mr-2" /> Yuklanmoqda...</div> : filteredDocs.length > 0 ? filteredDocs.map(doc => (
                  <div key={doc.id} className="p-5 border-b border-slate-50 hover:bg-slate-50/80 transition-colors flex justify-between items-start group">
                    <div className="flex gap-4"><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100"><BookOpen size={20} /></div><div><h4 className="font-bold text-slate-800 text-[15px]">{doc.title}</h4><div className="flex items-center gap-2 mt-1"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">ID: {doc.id}</span></div><p className="text-sm text-slate-500 mt-2 line-clamp-2 max-w-2xl">{doc.content}</p></div></div>
                    <button onClick={() => deleteDoc(doc.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </div>
                )) : <div className="flex flex-col items-center justify-center h-64 text-slate-400"><Database size={48} className="mb-4 opacity-50" /><p>Hujjatlar topilmadi</p></div>}
              </div>
            </div>
          )}

          {currentView === ViewState.BOT_SIMULATOR && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><h3 className="font-bold text-slate-700 text-sm">FinLex Simulator</h3></div></div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 telegram-bg">
                {chatHistory.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#EFFDDE] text-slate-900 rounded-br-none border border-[#E0F3CD]' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'}`}>
                      <FormatText text={msg.text} />
                    </div>
                  </div>
                ))}
                <div ref={simEndRef} />
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 relative">
                  <input type="text" value={simInput} onChange={e => setSimInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSimSend()} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400" placeholder="Admin sifatida test qiling..." />
                  <button onClick={handleSimSend} disabled={isSimTyping || !simInput.trim()} className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"><Send size={18} /></button>
                </div>
              </div>
            </div>
          )}

          {currentView === ViewState.API_SETTINGS && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Settings className="text-blue-600" /> Tizim Sozlamalari</h2>

              <div className="space-y-6">
                <div className={`${apiKey ? 'bg-green-50 border-green-100 text-green-900' : 'bg-orange-50 border-orange-100 text-orange-900'} border rounded-xl p-4 flex gap-3`}>
                  {apiKey ? <CheckCircle2 className="shrink-0 text-green-600" /> : <AlertTriangle className="shrink-0" />}
                  <div>
                    <h4 className="font-bold">Google Gemini API Kaliti</h4>
                    <p className="text-sm mt-1">
                      {apiKey
                        ? (localStorage.getItem('finlex_gemini_api_key')
                          ? "Kalit brauzer xotirasidan (Local Storage) olingan."
                          : "Kalit server sozlamalaridan (.env) avtomatik olingan.")
                        : "API Kalit topilmadi. .env faylini tekshiring yoki shu yerga kiriting."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Gemini API Key</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">Kalitni <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 hover:underline">aistudio.google.com</a> dan olishingiz mumkin.</p>
                </div>

                <button onClick={handleSaveApiKey} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200">
                  Saqlash
                </button>
              </div>
            </div>
          )}

          {currentView === ViewState.TELEGRAM_CONFIG && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Server className="text-blue-600" /> Serverga Joylash</h2>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-900"><Database className="shrink-0" /><div><h4 className="font-bold">Supabase Integratsiyasi</h4><p className="text-sm mt-1">Endi ma'lumotlar avtomatik ravishda Supabase bulutida saqlanadi.</p></div></div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Terminal size={18} /> Terminal buyruqlari</h3>
                  <div className="bg-slate-900 rounded-xl p-5 text-slate-300 font-mono text-sm relative group shadow-xl shadow-slate-200">
                    <button onClick={() => { navigator.clipboard.writeText("npm install && node server.js"); addToast("Nusxalandi") }} className="absolute top-4 right-4 p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"><Copy size={14} className="text-white" /></button>
                    <div className="flex gap-2 mb-2"><span className="text-pink-500">$</span> npm install @supabase/supabase-js</div>
                    <div className="flex gap-2"><span className="text-pink-500">$</span> node server.js</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl shadow-slate-300 text-white text-sm font-bold animate-in slide-in-from-top-4 fade-in duration-300 ${t.type === 'success' ? 'bg-slate-900' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-600'}`}>
            {t.type === 'success' ? <CheckCircle2 size={18} className="text-green-400" /> : <Zap size={18} className="text-white" />} {t.message}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Helpers ---
const AdminSidebarItem = ({ view, current, set, icon: Icon, label }: any) => (
  <button onClick={() => set(view)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${current === view ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <Icon size={18} /> <span>{label}</span>
    {current === view && <ChevronRight size={14} className="ml-auto opacity-50" />}
  </button>
);

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
    <div><p className="text-sm font-medium text-slate-500">{label}</p><h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3></div>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : color === 'green' ? 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}><Icon size={24} /></div>
  </div>
);

export default App;