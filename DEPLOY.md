# نشر Dantal — Vercel + Railway

## المستودعات

| الجزء | GitHub |
|-------|--------|
| Frontend | https://github.com/ahmedthyab2017/Dentalbook-1 |
| Backend | https://github.com/ahmedthyab2017/Dental-book-3 |

---

## 1) نشر الـ Backend على Railway

### الخطوات

1. ادخل [Railway](https://railway.app) وسجّل دخول بحساب GitHub.
2. **New Project** → **Deploy from GitHub repo** → اختر `Dental-book-3`.
3. أضف **PostgreSQL** للمشروع:
   - **+ New** → **Database** → **PostgreSQL**
4. افتح خدمة الـ **API** (Dental-book-3) → **Variables** → أضف:

   | Variable | القيمة |
   |----------|--------|
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `JWT_SECRET` | سلسلة عشوائية طويلة (32+ حرف) |
   | `FRONTEND_URL` | رابط Vercel (تضيفه بعد خطوة 2) |

5. اربط PostgreSQL بالـ API:
   - خدمة API → **Variables** → **Add Reference** → اختر متغيرات `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` من Postgres.
6. **Settings** → **Networking** → **Generate Domain** → انسخ الرابط (مثل `https://dantal-api-production.up.railway.app`).
7. انتظر حتى **Deploy** ينجح وتحقق من: `https://YOUR-DOMAIN.up.railway.app/v1/health`

### ملاحظات Railway

- الملف `railway.toml` و `Dockerfile` جاهزين للبناء التلقائي.
- CORS يقبل `https://*.vercel.app` تلقائياً في وضع `prod`.
- حساب Super Admin **لا** يُنشأ تلقائياً في `prod` — أنشئ عيادات عبر API أو أضف seeder لاحقاً.

---

## 2) نشر الـ Frontend على Vercel

### الخطوات

1. ادخل [Vercel](https://vercel.com) وسجّل دخول بحساب GitHub.
2. **Add New Project** → اختر مستودع `Dentalbook-1`.
3. إعدادات البناء (تلقائية لـ Next.js):

   | الإعداد | القيمة |
   |---------|--------|
   | Framework | Next.js |
   | Build Command | `npm run build` |
   | Output | (افتراضي) |

4. **Environment Variables** → أضف:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | رابط Railway من الخطوة 1 (بدون `/` في الآخر) |

   مثال: `https://dantal-api-production.up.railway.app`

5. اضغط **Deploy**.
6. بعد النشر، انسخ رابط Vercel (مثل `https://dentalbook-1.vercel.app`).
7. ارجع لـ **Railway** → حدّث `FRONTEND_URL` بهذا الرابط → أعد نشر الـ API.

---

## 3) التحقق

1. افتح رابط Vercel → `/login`
2. إذا كان الـ API مضبوط، ستظهر رسالة «متصل بالخادم».
3. جرّب تسجيل عيادة أو دخول Super Admin (إذا أضفته يدوياً في قاعدة البيانات).

---

## 4) ترخيص التطوير

في الإنتاج لا يوجد مفتاح `DANTAL-DEV-CLINIC` تلقائياً. أضف مفاتيح ترخيص في جدول `license_keys` أو فعّل من لوحة المنصة بعد إعداد Super Admin.

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| CORS error في المتصفح | تأكد من `FRONTEND_URL` على Railway وصحة `NEXT_PUBLIC_API_URL` على Vercel |
| API لا يعمل | تحقق من `/v1/health` وربط PostgreSQL |
| Build فشل على Vercel | راجع Logs — غالباً متغير بيئة ناقص |
| JWT error | `JWT_SECRET` مطلوب في Railway ولا يقل عن 32 حرف |
