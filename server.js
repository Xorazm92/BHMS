// --- FinLex AI: UNIFIED SERVER ---
// 1. Telegram Botni ishlatadi.
// 2. Admin Panelni (Web) brauzerga uzatadi.
// 3. Fayl importlarini (.ts, .tsx) avtomatik to'g'irlaydi.

import { Telegraf } from 'telegraf';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transform } from 'sucrase';

// --- 1. SOZLAMALAR ---
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = process.env.BOT_TOKEN || "8574437707:AAGsyX3ipeEevEcAq6EM1hy1cw_VVHr_sGk";
// Agar .env da API KEY bo'lmasa, server to'xtab qolmaydi, xato xabar chiqaradi.
const GEMINI_API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljxfducrmevaxvzykasm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_lMoLI7EBg5ymUOteNiIKgA_geb75o-w';

// --- 2. XIZMATLARNI ULAB OLISH ---
const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// AI Clientni dinamik yaratish (Xatolik bo'lsa yangilash oson bo'lishi uchun)
const getAIClient = () => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("PLACEHOLDER") || GEMINI_API_KEY.length < 10) {
        return null;
    }
    return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
};

// --- 3. MANTIQ (LOGIKA) ---
const FALLBACK_DOCS = [
    { title: "Tizim Xabari", content: "Hozircha ma'lumotlar bazasi ulanmagan yoki bo'sh." }
];

async function getRelevantDocuments(query) {
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('title, content')
                .eq('is_active', true);

            if (!error && data && data.length > 0) {
                const searchTerms = query.toLowerCase().split(' ').filter(w => w.length > 3);
                if (searchTerms.length === 0) return data.slice(0, 5);

                const relevant = data.filter(doc => {
                    const text = (doc.title + " " + doc.content).toLowerCase();
                    return searchTerms.some(term => text.includes(term));
                });
                return relevant.length > 0 ? relevant.slice(0, 8) : [];
            }
        } catch (err) {
            console.error("⚠️ DB Error:", err.message);
        }
    }
    return FALLBACK_DOCS;
}

async function generateAIResponse(userMsg, contextDocs) {
    const ai = getAIClient();

    // Agar serverda API Key bo'lmasa, chiroyli xato qaytaramiz
    if (!ai) {
        return "⚠️ **Tizim Xatoligi:** Serverda Google API Kaliti sozlanmagan.\n\nAdmin Panelga kirib sozlang yoki `.env` faylga kalitni qo'shing.";
    }

    try {
        const contextText = contextDocs.map(d => `📄 ${d.title}:\n${d.content}`).join("\n\n");
        const prompt = `
SEN: FinLex AI - O'zbekiston buxgalteriya ekspertisan.
BILIMLAR BAZASI:
${contextText}

SAVOL: "${userMsg}"

VAZIFA: Faqat bazaga asoslanib, aniq va qonuniy javob ber. Agar ma'lumot bo'lmasa, "Bazada ma'lumot yo'q" de.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        return response.text;
    } catch (e) {
        console.error("⚠️ AI Error:", e.message);
        if (e.message.includes("API key not valid") || e.message.includes("400")) {
            return "🚫 **API Kalit Xatosi:** Kiritilgan Google API kaliti yaroqsiz. Iltimos, yangi kalit oling.";
        }
        return "⚠️ Tizimda vaqtincha xatolik yuz berdi.";
    }
}

async function logChat(role, text) {
    if (supabase) {
        try {
            await supabase.from('chat_history').insert([{ role, text }]);
        } catch (e) {
            console.error("⚠️ LogChat Error:", e.message);
        }
    }
}

// --- 4. BOT HANDLERS ---
bot.start((ctx) => ctx.reply("🛡 **FinLex AI** ga xush kelibsiz! Savolingizni yozing.", { parse_mode: 'Markdown' }));

bot.on('text', async (ctx) => {
    const userMsg = ctx.message.text;
    await ctx.sendChatAction('typing');
    logChat('user', userMsg);

    const docs = await getRelevantDocuments(userMsg);
    const response = await generateAIResponse(userMsg, docs);

    await ctx.reply(response, { parse_mode: 'Markdown' }).catch(() => ctx.reply(response));
    logChat('model', response);
});

// --- 5. WEB SERVER (ADMIN PANEL) ---
const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    // EXTENSION RESOLVER:
    // Brauzer "import X from './types'" deganda server "types.ts" ni topib berishi kerak.
    if (!fs.existsSync(filePath)) {
        if (fs.existsSync(filePath + '.ts')) filePath += '.ts';
        else if (fs.existsSync(filePath + '.tsx')) filePath += '.tsx';
        else if (fs.existsSync(filePath + '.js')) filePath += '.js';
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.tsx': 'text/javascript', // Serve as JS for browser module compatibility
        '.ts': 'text/javascript'
    };

    contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                // Agar fayl topilmasa, index.html ni qaytaramiz (SPA ishlashi uchun)
                fs.readFile('./index.html', (err, indexContent) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error loading index.html');
                    } else {
                        const envScript = `
    <script>
      window.process = {
        env: ${JSON.stringify({
                            SUPABASE_URL: process.env.SUPABASE_URL,
                            SUPABASE_KEY: process.env.SUPABASE_KEY,
                            GEMINI_API_KEY: process.env.API_KEY || process.env.GEMINI_API_KEY
                        })}
      };
    </script>
`;
                        const body = indexContent.toString().replace('</head>', envScript + '</head>');
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(body, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            let body = content;
            if (filePath.endsWith('index.html')) {
                const envScript = `
    <script>
      window.process = {
        env: ${JSON.stringify({
                    SUPABASE_URL: process.env.SUPABASE_URL,
                    SUPABASE_KEY: process.env.SUPABASE_KEY,
                    GEMINI_API_KEY: process.env.API_KEY || process.env.GEMINI_API_KEY
                })}
      };
    </script>
`;
                body = content.toString().replace('</head>', envScript + '</head>');
            }
            if (extname === '.ts' || extname === '.tsx') {
                try {
                    const result = transform(content.toString(), {
                        transforms: ['typescript', 'jsx'],
                    });
                    body = result.code;
                    res.writeHead(200, { 'Content-Type': 'text/javascript' });
                } catch (e) {
                    console.error(`❌ Transpilation Error (${filePath}):`, e.message);
                    res.writeHead(500);
                    res.end('Transpilation Error: ' + e.message);
                    return;
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
            }
            res.end(body, 'utf-8');
        }
    });
});

// Serverni ishga tushirish
server.listen(PORT, () => {
    console.log(`\n===============================================`);
    console.log(`✅ FinLex Server ishga tushdi!`);
    console.log(`🌍 WEB (Admin Panel): http://localhost:${PORT}`);
    console.log(`🤖 TELEGRAM BOT:      Faol (Listening...)`);
    console.log(`===============================================\n`);
});

// Botni ishga tushirish (xatolik bo'lsa serverni o'ldirmaydi)
bot.launch().catch(err => {
    console.error("❌ Bot xatolik bilan to'xtadi (Token noto'g'ri bo'lishi mumkin):", err.message);
});

// To'xtatish (Ctrl+C)
process.once('SIGINT', () => { bot.stop('SIGINT'); server.close(); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); server.close(); });