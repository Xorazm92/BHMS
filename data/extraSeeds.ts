import { DocumentChunk } from "../types";

export const EXTRA_SEEDS: DocumentChunk[] = [
    // --- SOLIQ KODEKSI (TAX CODE) ---
    {
        id: 'tax-1',
        title: 'Soliq Kodeksi: Umumiy qoidalar va Soliq turlari',
        category: 'TAX',
        isActive: true,
        createdAt: Date.now(),
        content: `O'zbekiston Respublikasining Soliq Kodeksi (Yangi tahrir).
ASOSIY TUSHUNCHALAR:
- Soliq solish obyekti: daromad, mol-mulk, yer, suv va boshqalar.
- Soliq bazasi: soliq stavkasi qo'llaniladigan qiymat yoki miqdoriy ko'rsatkich.
SOLIQ TURLARI:
1. Qo'shilgan qiymat solig'i (QQS) - 12%.
2. Foyda solig'i - 15% (ayrim korxonalar uchun turlicha).
3. Jismoniy shaxslardan olinadigan daromad solig'i (JSHDS) - 12%.
4. Ijtimoiy soliq - 12% (byudjet tashkilotlari 25%).
5. Mol-mulk solig'i.
6. Yer solig'i.
7. Suv resurslaridan foydalanganlik uchun soliq.
8. Yer qa'ridan foydalanganlik uchun soliq.
9. Aksiz solig'i.`
    },
    {
        id: 'tax-2',
        title: 'Soliq Kodeksi: QQS (Qo\'shilgan Qiymat Solig\'i)',
        category: 'TAX',
        isActive: true,
        createdAt: Date.now(),
        content: `QQS (VAT) - O'zbekistonda 12% stavkada hisoblanadi.
TO'LOVCHILAR: Yillik aylanmasi 1 mlrd so'mdan oshgan korxonalar va YaTTlar majburiy tartibda, qolganlar ixtiyoriy.
SOLIQQA TORTISH OBYEKTI: Tovarlarni (xizmatlarni) realizatsiya qilish, tovarlarni import qilish.
QQSNI HISOBGA OLISH (OFFSET): Sotib olingan tovarlar bo'yicha to'langan QQS, sotishda hisoblangan QQSdan chegiriladi.`
    },
    {
        id: 'tax-3',
        title: 'Soliq Kodeksi: Foyda solig\'i va JSHDS',
        category: 'TAX',
        isActive: true,
        createdAt: Date.now(),
        content: `FOYDA SOLIG'I:
- Umumiy stavka: 15%.
- Banklar va mobil aloqa operatorlari: 20%.
- Eksport ulushi 15% dan ko'p bo'lgan korxonalar (ayrim hollarda): imtiyozli 0%.
JSHDS (PIT):
- Jismoniy shaxslar daromadidan 12% miqdorida ushlab qolinadi.
- Dividendlar va foizlar shaklidagi daromadlar: 5% (rezidentlar uchun).`
    },
    {
        id: 'tax-4',
        title: 'Soliq Kodeksi: Aylanmadan olinadigan soliq',
        category: 'TAX',
        isActive: true,
        createdAt: Date.now(),
        content: `Aylanmadan olinadigan soliq (Soddalashtirilgan tizim):
- Yillik tushumi 1 mlrd so'mgacha bo'lgan tadbirkorlik subyektlari uchun.
- Bazaviy stavka: 4%.
- Qishloq joylarda, savdo va umumiy ovqatlanishda stavkalar farqlanishi mumkin.
2023-yildan boshlab qatiy summada soliq to'lash imkoniyati ham mavjud.`
    },

    // --- MEHNAT KODEKSI (LABOR CODE) ---
    {
        id: 'labor-1',
        title: 'Mehnat Kodeksi: Mehnat shartnomasi va ishga qabul qilish',
        category: 'LABOR',
        isActive: true,
        createdAt: Date.now(),
        content: `Yangilangan Mehnat Kodeksi (2022/2023).
MEHNAT SHARTNOMASI: Xodim va ish beruvchi o'rtasidagi kelishuv.
MUDDATLARI:
- Nomuayyan muddatga (muddatsiz).
- Muayyan muddatga (5 yilgacha, muddatli).
ISHGA QABUL QILISh: 16 yoshdan (ayrim hollarda 15 va 14 yoshdan).
DOKUMENTLAR: Pasport (ID karta), mehnat daftarchasi (yoki elektron), diplom (agar kerak bo'lsa), harbiy bilet.`
    },
    {
        id: 'labor-2',
        title: 'Mehnat Kodeksi: Ish vaqti va Dam olish vaqti',
        category: 'LABOR',
        isActive: true,
        createdAt: Date.now(),
        content: `ISH VAQTI:
- Normal ish haftasi: 40 soatdan oshmasligi kerak.
- Qisqartirilgan ish vaqti: 16-18 yoshdagilar uchun haftasiga 36 soatgacha, 15 yoshdagilar uchun 24 soatgacha.
DAM OLISH VAQTI:
- Kunlik dam olish (tushlik): 30 daqiqadan 2 soatgacha.
- Haftalik dam olish: kamida ketma-ket 42 soat.
TA'TIL: Yillik asosiy ta'til kamida 21 kalendar kun etib belgilangan (yangi Kodeks bo'yicha).`
    },
    {
        id: 'labor-3',
        title: 'Mehnat Kodeksi: Ish haqi va Kafolatlar',
        category: 'LABOR',
        isActive: true,
        createdAt: Date.now(),
        content: `ISH HAQI:
- Kamida oyiga ikki marta to'lanadi (oraliq 15 kundan oshmasligi kerak).
- Eng kam ish haqi miqdoridan (MHEKM) kam bo'lishi mumkin emas.
- Ish vaqtidan tashqari ishlar, dam olish va bayram kunlari: kamida ikki hissa miqdorida to'lanadi.`
    },
    {
        id: 'labor-4',
        title: 'Mehnat Kodeksi: Intizomiy choralar va Shartnomani bekor qilish',
        category: 'LABOR',
        isActive: true,
        createdAt: Date.now(),
        content: `INTIZOMIY JAZOLAR:
1. Hayfsan.
2. Jarima (o'rtacha oylik ish haqining 30% igacha, ayrim hollarda 50%igacha).
3. Mehnat shartnomasini bekor qilish (oxirgi chora).
BO'SHATISH:
- Xodim tashabbusi bilan: 14 kun oldin ariza berishi kerak.
- Ish beruvchi tashabbusi bilan: shtat qisqarishi, xodimning malakasi yetarli emasligi yoki intizomni buzishi sababli (kasaba uyushmasi roziligi kerak bo'lishi mumkin).`
    }
];
