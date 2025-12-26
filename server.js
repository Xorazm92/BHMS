// --- Finco AI: UNIFIED SERVER ---
// 1. Telegram Botni ishlatadi.
// 2. Admin Panelni (Web) brauzerga uzatada.
// 3. Fayl importlarini (.ts, .tsx) avtomatik to'g'irlaydi.
// 4. Logging system bilan ishlaydi.

import { Telegraf } from 'telegraf';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

// --- LOGGING SYSTEM ---
const logFile = path.join(__dirname, 'server.log');
const log = (level, message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(logFile, logMessage);
};

log('INFO', 'Server starting up...');

const BOT_TOKEN = process.env.BOT_TOKEN || "8574437707:AAGsyX3ipeEevEcAq6EM1hy1cw_VVHr_sGk";
// Agar .env da API KEY bo'lmasa, server to'xtab qolmaydi, xato xabar chiqaradi.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljxfducrmevaxvzykasm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_lMoLI7EBg5ymUOteNiIKgA_geb75o-w';

// --- 2. XIZMATLARNI ULAB OLISH ---
const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// AI Clientni dinamik yaratish (Xatolik bo'lsa yangilash oson bo'lishi uchun)
const getAIClient = () => {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key || key.includes("your_gemini_api_key_here") || key.length < 10) {
        return null;
    }
    return new GoogleGenerativeAI(key);
};

// --- 3. MANTIQ (LOGIKA) ---
const LOCAL_DOCS = [
    { title: 'BHMS 1-son: Hisob siyosati', content: '1-sonli BHMS. Maqsad: moliyaviy hisobotni tuzish va taqdim etish qoidalarini belgilash. Hisob siyosati, Uzluksizlik tamoyili, Moslik tamoyili.' },
    { title: 'BHMS 2-son: Daromadlar', content: '2-sonli BHMS. Asosiy xo‘jalik faoliyatidan olingan daromadlar. Tan olish shartlari: mulk huquqi o‘tishi, ishonchli baholash, iqtisodiy naf.' },
    { title: 'BHMS 3-son: Moliyaviy natijalar', content: '3-sonli BHMS. Moliyaviy natijalar to‘g‘risidagi hisobot. Tarkibi: daromadlar, xarajatlar, foyda va zararlar.' },
    { title: 'BHMS 4-son: TMZ', content: '4-sonli BHMS. Tovar-moddiy zaxiralar. Baholash: tannarx yoki sof sotish qiymatining eng pastida. FIFO, AVECO usullari.' },
    { title: 'BHMS 5-son: Asosiy vositalar', content: '5-sonli BHMS. Asosiy vositalar (AV). Amortizatsiya usullari: To\'g\'ri chiziqli, Kamayib boruvchi qoldiq, Ish hajmi.' },
    { title: 'BHMS 6-son: Ijara', content: '6-sonli BHMS. Moliyaviy ijara (lizing) va Operativ ijara turlari.' },
    { title: 'BHMS 7-son: Nomoddiy aktivlar', content: '7-sonli BHMS. Nomoddiy aktivlar (Litsenziyalar, Dasturlar). Tannarx bo\'yicha hisob va amortizatsiya.' },
    { title: 'BHMS 8-son: Konsolidatsiya', content: '8-sonli BHMS. Ona va sho‘ba korxonalar moliyaviy hisobotini birlashtirish qoidalari.' },
    { title: 'BHMS 9-son: Pul oqimlari', content: '9-sonli BHMS. Pul mablag‘lari oqimlari to‘g‘risidagi hisobot. Operatsion, investitsiya va moliyaviy faoliyat.' },
    { title: 'BHMS 10-son: Subsidiyalar', content: '10-sonli BHMS. Davlat subsidiyalari hisobi va ularni daromad sifatida tan olish.' },
    { title: 'BHMS 11-son: ITTKI / R&D', content: '11-sonli BHMS. Ilmiy-tadqiqot va tajriba-konstruktorlik ishlari xarajatlari.' },
    { title: 'BHMS 12-son: Investitsiyalar', content: '12-sonli BHMS. Moliyaviy investitsiyalar: qisqa va uzoq muddatli qo\'yilmalar.' },
    { title: 'BHMS 14-son: Xususiy kapital', content: '14-sonli BHMS. Xususiy kapital to‘g‘risidagi hisobot va uning tarkibi.' },
    { title: 'BHMS 15-son: Balans', content: '15-sonli BHMS. Buxgalteriya balansining tuzilishi (Aktivlar, Majburiyatlar, Kapital).' },
    { title: 'BHMS 16-son: Uzluksiz TMZ', content: '16-sonli BHMS. Uzluksiz jarayonda tovar-moddiy zaxiralarni hisobga olish xususiyatlari.' },
    { title: 'BHMS 17-son: Qurilish', content: '17-sonli BHMS. Qurilish shartnomalari bo‘yicha daromad va xarajatlar (Tayyorlik darajasiga ko\'ra).' },
    {
        title: 'BHMS 19-son: Inventarizatsiya', content: '19-sonli BHMS. Yo\'qlama (inventarizatsiya) o\'tkazish tartibi va natijalarni aks ettirish.'
    },
    { title: 'BHMS 20-son: Kichik tadbirkorlik', content: '20-sonli BHMS. Kichik biznes subyektlari uchun soddalashtirilgan hisob qoidalari.' },
    { title: 'BHMS 21-son: Hisoblar rejasi', content: '21-sonli BHMS. Yagona hisoblar rejasi (0100-9900 hisoblar).' },
    { title: 'BHMS 22-son: Valyuta kursi', content: '22-sonli BHMS. Valyuta kurs farqlarini hisobga olish va qayta baholash.' },
    { title: 'BHMS 23-son: Qayta tashkil etish', content: '23-sonli BHMS. Korxonalarni qo\'shish, bo\'lish va o\'zgartirish hisobi.' },
    { title: 'BHMS 24-son: Qarz xarajatlari', content: '24-sonli BHMS. Kredit va qarzlar bo‘yicha foizlarni kapitallashtirish yoki xarajatga chiqarish.' }
];

async function getRelevantDocuments(query, category = null) {
    let allDocs = [...LOCAL_DOCS];

    try {
        if (supabase) {
            let dbQuery = supabase
                .from('documents')
                .select('title, content, category')
                .eq('is_active', true);

            if (category && category !== 'ALL') {
                dbQuery = dbQuery.eq('category', category);
            }

            const { data, error } = await dbQuery;

            if (!error && data && data.length > 0) {
                allDocs = [...data, ...LOCAL_DOCS];
            }
        }
    } catch (err) {
        console.error("⚠️ Supabase ulanishda xato, local bazadan foydalaniladi.");
    }

    // Agar kategoriya bo'lsa, local docs ni ham filterlaymiz
    if (category && category !== 'ALL') {
        allDocs = allDocs.filter(d => d.category === category);
    }

    const searchTerms = query.toLowerCase()
        .split(/[\s,.-]+/)
        .filter(w => w.length >= 1 && !['nima', 'edi', 'haqida', 'ber', 'uchun'].includes(w));

    if (searchTerms.length === 0) return allDocs.slice(0, 5);

    const relevant = allDocs.filter(doc => {
        const text = (doc.title + " " + (doc.content || "")).toLowerCase();
        return searchTerms.some(term => text.includes(term));
    });

    return relevant.length > 0 ? relevant.slice(0, 10) : allDocs.slice(0, 3);
}

async function generateAIResponse(userMsg, contextDocs) {
    const ai = getAIClient();

    if (!ai) {
        return "⚠️ **Tizim Xatoligi:** Serverda Google API Kaliti sozlanmagan.\n\nAdmin Panelga kirib sozlang yoki `.env` faylga kalitni qo'shing.";
    }

    try {
        const contextText = contextDocs.map(d => `📄 ${d.title}:\n${d.content}`).join("\n\n");
        const model = ai.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: "Sen Finco AI - O'zbekiston Buxgalteriya (BHMS), Soliq va Mehnat qonunchiligi bo'yicha ekspertsan. Javoblaringni aniq, qonuniy va chiroyli formatda (Markdown) taqdim et."
        });

        const prompt = `
BILIMLAR BAZASI:
${contextText}

SAVOL: "${userMsg}"

VAZIFA: Bilimlar bazasiga tayanib javob ber. Agar bazada yo'q bo'lsa, o'z bilimingdan foydalan, lekin buni ta'kidla.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (e) {
        console.error("⚠️ AI Error:", e.message);
        return "⚠️ Tizimda vaqtincha xatolik yuz berdi yoki API kalitda muammo bor.";
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
const userSessions = new Map();

const getMainMenu = () => {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: "📘 BHMS", callback_data: "cat_BHMS" }, { text: "⚖️ Soliq Kodeksi", callback_data: "cat_TAX" }],
                [{ text: "👷 Mehnat Kodeksi", callback_data: "cat_LABOR" }, { text: "📚 Hammasi", callback_data: "cat_ALL" }]
            ]
        },
        parse_mode: 'Markdown'
    };
};

bot.start((ctx) => {
    ctx.reply("🛡 **Finco AI** ga xush kelibsiz!\n\nSavolingizni qaysi yo'nalish bo'yicha bermoqchisiz? Quyidagilardan birini tanlang:", getMainMenu());
});

bot.action(/cat_(.+)/, async (ctx) => {
    const category = ctx.match[1];
    userSessions.set(ctx.from.id, category);
    const catNames = { 'BHMS': 'BHMS', 'TAX': 'Soliq Kodeksi', 'LABOR': 'Mehnat Kodeksi', 'ALL': 'Barcha bo\'limlar' };
    await ctx.answerCbQuery();
    await ctx.reply(`✅ Siz **${catNames[category]}** bo'limini tanladingiz. Savolingizni yozishingiz mumkin.`, { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx) => {
    const userMsg = ctx.message.text;
    const userId = ctx.from.id;
    const category = userSessions.get(userId) || 'ALL';

    await ctx.sendChatAction('typing');
    logChat(`user_${userId}`, userMsg);

    const docs = await getRelevantDocuments(userMsg, category);
    const response = await generateAIResponse(userMsg, docs);

    await ctx.reply(response, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{ text: "🔄 Bo'limni o'zgartirish", callback_data: "show_menu" }]]
        }
    }).catch(() => ctx.reply(response));

    logChat('model', response);
});

bot.action('show_menu', (ctx) => {
    ctx.editMessageText("🛡 Savolingiz yo'nalishini tanlang:", getMainMenu());
});

// --- 5. WEB SERVER (ADMIN PANEL) ---
const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // AI API ENDPOINT
    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { message, category } = JSON.parse(body);
                const docs = await getRelevantDocuments(message, category);
                const aiResponse = await generateAIResponse(message, docs);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response: aiResponse }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

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
                            ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
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
                    GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.API_KEY,
                    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
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
                    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
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
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n===============================================`);
    console.log(`✅ Finco Server ishga tushdi!`);
    console.log(`🌍 WEB (Admin Panel): http://localhost:${PORT}`);
    console.log(`🤖 TELEGRAM BOT:      Launched and waiting for messages...`);

    if (!getAIClient()) {
        console.warn(`\n⚠️  DIQQAT: .env faylida GEMINI_API_KEY sozlanmagan!`);
        console.warn(`   Telegram bot javob bermasligi mumkin.`);
        console.warn(`   Iltimos, .env faylida haqiqiy Gemini API kalitini kiritib serverni qayta ishga tushiring.\n`);
    } else {
        console.log(`✨ AI EXPERT:         Bot is connected to Gemini AI.`);
    }
    console.log(`===============================================\n`);
});

// Botni ishga tushirish (xatolik bo'lsa serverni o'ldirmaydi)
bot.launch().catch(err => {
    console.error("❌ Bot xatolik bilan to'xtadi (Token noto'g'ri bo'lishi mumkin):", err.message);
});

// To'xtatish (Ctrl+C)
process.once('SIGINT', () => { bot.stop('SIGINT'); server.close(); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); server.close(); });