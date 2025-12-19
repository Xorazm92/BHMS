import { DocumentChunk } from "../types";

export const BHMS_SEEDS: DocumentChunk[] = [
  {
    id: 'bhms-1',
    title: 'BHMS 1-son: Hisob siyosati va moliyaviy hisobot',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `1-sonli Buxgalteriya Hisobi Milliy Standarti (BHMS).
MAQSAD: Ushbu standartning maqsadi xo‘jalik yurituvchi subyektlarning moliyaviy hisobotini tuzish va taqdim etish qoidalarini belgilashdan iborat.
ASOSIY QOIDALAR:
- Hisob siyosati — bu moliyaviy hisobotni tuzish va taqdim etish uchun subyekt tomonidan qabul qilingan aniq tamoyillar, asoslar, shartlar, qoidalar va usuliyatlar.
- Moliyaviy hisobot xo‘jalik yurituvchi subyektning moliyaviy holati va faoliyati to‘g‘risida haqqoniy va to‘liq ma’lumot berishi kerak.
- Uzluksizlik tamoyili: Moliyaviy hisobot subyekt o‘z faoliyatini kelajakda ham davom ettiradi degan faraz asosida tuzilishi kerak.
- Daromadlar va xarajatlarning mosligi: Hisobot davrida olingan daromadlar shu daromadlarni olish bilan bog‘liq xarajatlarga mos kelishi kerak.`
  },
  {
    id: 'bhms-2',
    title: 'BHMS 2-son: Asosiy xo‘jalik faoliyatidan olingan daromadlar',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `2-sonli BHMS.
MAQSAD: Asosiy xo‘jalik faoliyatidan olingan daromadlarni buxgalteriya hisobida aks ettirish tartibini belgilash.
TAN OLISH: Daromad quyidagi shartlar bajarilganda tan olinadi:
a) aktivning mulk huquqi xaridorga o‘tgan bo‘lsa;
b) tovarlarning qiymatini ishonchli baholash mumkin bo‘lsa;
c) bitim bo‘yicha iqtisodiy naf olish ehtimoli mavjud bo‘lsa.
- Tovar sotishdan, xizmat ko'rsatishdan, foizlar, royaltilar va dividendlar shaklidagi daromadlar qamrab olinadi.`
  },
  {
    id: 'bhms-3',
    title: 'BHMS 3-son: Moliyaviy natijalar to‘g‘risidagi hisobot',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `3-sonli BHMS.
MAQSAD: Moliyaviy natijalar to‘g‘risidagi hisobotni tuzish tartibini belgilash.
TARKIBI: Hisobotda daromadlar, xarajatlar, foyda va zararlar davrlar bo‘yicha taqqoslanadigan shaklda ko‘rsatilishi shart.
- Asosiy ko'rsatkichlar: Mahsulot sotishdan sof tushum, Sotilgan mahsulot tannarxi, Yalpi foyda, Davr xarajatlari, Asosiy faoliyat foydasi, Foyda solig'i to'lagungacha bo'lgan foyda, Sof foyda.`
  },
  {
    id: 'bhms-4',
    title: 'BHMS 4-son: Tovar-moddiy zaxiralar',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `4-sonli BHMS.
MAQSAD: Tovar-moddiy zaxiralarni (TMZ) hisobga olish.
BAHOLASH: TMZlar tannarx (sotib olish xarajatlari) bo‘yicha hisobga olinadi. Agar sof sotish qiymati tannarxdan past bo'lsa, pastki qiymatda baholanadi.
HISOBDAN CHIQARISH USULLARI:
1. FIFO (First In, First Out) - birinchi kelgan birinchi ketadi.
2. O‘rtacha tortilgan qiymat usuli (AVECO).
3. Identifikatsiya qilingan tannarx usuli (maxsus buyurtmalar uchun).`
  },
  {
    id: 'bhms-5',
    title: 'BHMS 5-son: Asosiy vositalar',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `5-sonli BHMS.
MAQSAD: Asosiy vositalarni (AV) hisobga olish, eskirish hisoblash va ta'mirlash xarajatlarini aks ettirish.
TA'RIF: Asosiy vositalar - bu uzoq muddat (bir yildan ortiq) davomida mahsulot ishlab chiqarish, xizmat ko‘rsatish yoki ma’muriy maqsadlarda foydalaniladigan moddiy aktivlar.
AMORTIZATSIYA: AV qiymati foydali xizmat muddati davomida amortizatsiya ajratmalari orqali xarajatga olib boriladi.
Usullar: To'g'ri chiziqli, Bajarilgan ishlar hajmi, Kamayib boruvchi qoldiq.`
  },
  {
    id: 'bhms-6',
    title: 'BHMS 6-son: Ijara hisobi',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `6-sonli BHMS. Ijara turlari: Moliyaviy ijara (lizing) va Operativ ijara. 
Moliyaviy ijarada aktiv bilan bog'liq barcha xatar va naflar ijarachiga o'tadi.
Operativ ijarada aktiv balansi ijaraga beruvchida qoladi.`
  },
  {
    id: 'bhms-7',
    title: 'BHMS 7-son: Nomoddiy aktivlar',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `7-sonli BHMS. Nomoddiy aktivlar - moddiy-ashyoviy ko‘rinishga ega bo‘lmagan, identifikatsiya qilinadigan monetar bo‘lmagan aktivlar (Litsenziya, Dasturiy ta'minot, Gudvill). Ular tannarx bo'yicha hisobga olinadi va foydali xizmat muddati davomida amortizatsiya qilinadi.`
  },
  {
    id: 'bhms-8',
    title: 'BHMS 8-son: Konsolidatsiyalashgan moliyaviy hisobot',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `8-sonli BHMS. Ona korxona va uning sho‘ba korxonalari aktivlari, majburiyatlari, kapitali, daromadlari va xarajatlarini yagona iqtisodiy birlik sifatida taqdim etish qoidalari. Guruh ichidagi operatsiyalar chiqarib tashlanadi.`
  },
  {
    id: 'bhms-9',
    title: 'BHMS 9-son: Pul oqimlari to‘g‘risidagi hisobot',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `9-sonli BHMS. Pul mablag‘lari va ularning ekvivalentlari oqimlarini operatsion, investitsiya va moliyaviy faoliyat turlari bo‘yicha tasniflash. 
Bevosita va bilvosita usullar orqali hisobot tuzish.`
  },
  {
    id: 'bhms-10',
    title: 'BHMS 10-son: Davlat subsidiyalari hisobi',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `10-sonli BHMS. Davlat tomonidan beriladigan yordam va subsidiyalarni hisobda aks ettirish. Subsidiyalar bajarilishi lozim bo'lgan shartlar bajarilganda daromad sifatida tan olinadi.`
  },
  {
    id: 'bhms-11',
    title: 'BHMS 11-son: Ilmiy-tadqiqot va tajriba-konstruktorlik ishlari',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `11-sonli BHMS. ITTKI (R&D) xarajatlarini tan olish. Tadqiqot xarajatlari davr xarajatlariga olib boriladi. Tajriba-konstruktorlik ishlari ma'lum shartlar bajarilganda kapitallashtirilishi mumkin.`
  },
  {
    id: 'bhms-12',
    title: 'BHMS 12-son: Moliyaviy investitsiyalar hisobi',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `12-sonli BHMS. Qimmatli qog'ozlar, ustav kapitaliga kiritilgan investitsiyalar va boshqa moliyaviy qo'yilmalarni hisobga olish. Ular qisqa muddatli va uzoq muddatli turlarga bo'linadi.`
  },
  {
    id: 'bhms-14',
    title: 'BHMS 14-son: Xususiy kapital to‘g‘risidagi hisobot',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `14-sonli BHMS. Hisobot davri mobaynida xususiy kapitaldagi o‘zgarishlarni yoritish. Ustav kapitali, qo'shimcha kapital, rezerv kapitali va taqsimlanmagan foyda o'zgarishlari ko'rsatiladi.`
  },
  {
    id: 'bhms-15',
    title: 'BHMS 15-son: Buxgalteriya balansi',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `15-sonli BHMS. Buxgalteriya balansining tuzilishi va mazmuni. Aktivlar = Majburiyatlar + Xususiy Kapital.
Aktivlar joriy va uzoq muddatli aktivlarga bo'linadi. Majburiyatlar ham joriy va uzoq muddatli bo'ladi.`
  },
  {
    id: 'bhms-16',
    title: 'BHMS 16-son: Uzluksiz jarayonda Tovar-Moddiy Zaxiralar',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `16-sonli BHMS. (Izoh: Amaliyotda kam qo'llaniladi yoki boshqa standartlar bilan qamrab olinadi, lekin Lex.uz da mavjud bo'lsa: Uzluksiz ishlab chiqarish jarayonida materiallarni hisobga olish xususiyatlari).`
  },
  {
    id: 'bhms-17',
    title: 'BHMS 17-son: Qurilish shartnomalari',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `17-sonli BHMS. Pudrat tashkilotlarida qurilish shartnomalari bo‘yicha daromad va xarajatlarni hisobga olish. Daromad bajarilgan ishlar darajasiga qarab (Percentage of Completion) tan olinadi.`
  },
  {
    id: 'bhms-19',
    title: 'BHMS 19-son: Inventarizatsiyani tashkil etish',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `19-sonli BHMS. Aktivlar va majburiyatlarni inventarizatsiya qilish (yo'qlama) qoidalari. Yilda kamida bir marta yillik hisobot oldidan o'tkazilishi shart. Kamomat va ortiqchalar hisobda aks ettiriladi.`
  },
  {
    id: 'bhms-20',
    title: 'BHMS 20-son: Kichik tadbirkorlik subyektlari hisobi',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `20-sonli BHMS. Kichik korxonalar uchun soddalashtirilgan buxgalteriya hisobi qoidalari. Hisobotlarni topshirish muddatlari va shakllari yengillashtirilgan.`
  },
  {
    id: 'bhms-21',
    title: 'BHMS 21-son: Xo‘jalik yurituvchi subyektlarning hisoblar rejasi',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `21-sonli BHMS. O'zbekistonda qo'llaniladigan yagona Hisoblar Rejasi.
- 0100-0900: Asosiy vositalar
- 1000-2900: Tovar-moddiy zaxiralar
- 5000-5900: Pul mablag'lari
- 6000-6900: Majburiyatlar
- 9000-9900: Daromadlar va Xarajatlar`
  },
  {
    id: 'bhms-22',
    title: 'BHMS 22-son: Chet el valyutasidagi aktivlar va majburiyatlar',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `22-sonli BHMS. Chet el valyutasidagi operatsiyalarni milliy valyutada (So'm) aks ettirish.
Chet el valyutasidagi moddalar har oy oxirida Markaziy Bank kursi bo'yicha qayta baholanadi. Kurs farqlari moliyaviy natijaga (foyda yoki zarar) olib boriladi.`
  },
  {
    id: 'bhms-23',
    title: 'BHMS 23-son: Qayta tashkil etishni amalga oshirish',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `23-sonli BHMS. Qo‘shib yuborish, birlashtirish, bo‘lish, ajratib chiqarish va o‘zgartirish shaklidagi qayta tashkil etishda aktivlar va majburiyatlarni topshirish hamda hisobot tuzish tartibi.`
  },
  {
    id: 'bhms-24',
    title: 'BHMS 24-son: Qarzlar bo‘yicha xarajatlar hisobi',
    category: 'BHMS',
    isActive: true,
    createdAt: Date.now(),
    content: `24-sonli BHMS. Kreditlar va qarzlar bo‘yicha foizlar, komissiyalar va kurs farqlarini hisobga olish.
Malakali aktivlar (uzoq vaqt davomida tayyorlanadigan aktivlar) uchun qarz xarajatlari kapitallashtiriladi (aktiv tannarxiga qo'shiladi). Boshqa hollarda davr xarajati hisoblanadi.`
  }
];