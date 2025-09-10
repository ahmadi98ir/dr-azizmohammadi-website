# وبسایت کلینیک ترک اعتیاد و مشاوره خانواده — Next.js 15, Tailwind, TypeScript

این پروژه یک اسکلت کامل برای وبسایت کلینیک دکتر «سید مجید عزیزمحمدی» است با امکانات:

- ثبت‌نام و ورود کاربران (بیماران)
- رزرو نوبت آنلاین (ویزیت/مشاوره)
- گفت‌وگوی متنی آنلاین بین بیمار و کلینیک برای هر نوبت (real-time با SSE)
- بخش مدیریت (ادمین) برای مدیریت نوبت‌ها، کاربران و اعلان‌ها
- رابط فارسی، راست‌به‌چپ و سبک با Tailwind CSS
- تماس ویدئویی مبتنی بر Jitsi (ایفریم)
- پرداخت شبیه‌سازی‌شده (Mock) با کال‌بک و تغییر وضعیت نوبت
- CMS سبک: مقالات (Blog) و سوالات متداول (FAQ)
- ثبت‌نام با تأیید شماره موبایل (OTP): ابتدا شماره موبایل، سپس کد تایید پیامکی، سپس تکمیل اطلاعات

> توجه: برای نمونه اولیه از ذخیره‌سازی فایل JSON در پوشه `data/` استفاده شده است. برای محیط واقعی پیشنهاد می‌شود از پایگاه‌داده (مثلاً PostgreSQL/SQLite با Prisma) و سرویس احراز هویت حرفه‌ای استفاده شود.

## اجرای محلی

1) نصب وابستگی‌ها:

```bash
pnpm install
# یا
npm install
```

2) اجرای محیط توسعه:

```bash
pnpm dev
# یا
npm run dev
```

3) آدرس پیش‌فرض: `http://localhost:3000`

- اکانت مدیر به صورت خودکار ساخته می‌شود:
  - ایمیل: `admin@clinic.local`
  - رمز عبور: `admin1234`

## ساختار پوشه‌ها

- `app/` صفحات و API Routeهای Next.js 15 (App Router)
- `lib/` منطق دامنه (احراز هویت، سشن، دیتاستور JSON)
- `data/` فایل‌های داده (در اجرا ساخته می‌شوند)
- `app/api/*` سرویس‌های REST برای Auth, Appointments, Messages
- `prisma/schema.prisma` مدل‌های Prisma (SQLite پیش‌فرض)

## نکات فنی

- احراز هویت: سشن مبتنی بر کوکی (`session_token`) + ذخیره سشن در `data/sessions.json`.
- رمز عبور: `scrypt` از هسته Node برای هش و تایید.
- Middleware فقط وجود کوکی را چک می‌کند؛ کنترل سطح دسترسی نهایی در سرور انجام می‌شود.
- گفت‌وگو: SSE با مسیر `/api/messages/[appointmentId]/stream` (fallback به polling در کلاینت).
- پرداخت: API شبیه‌سازی‌شده `/api/payments/checkout` و `/api/payments/callback` + صفحه `/payments/mock`.
- ویدئو: صفحه `/meet/[id]` با Jitsi (دامنه پیش‌فرض: `meet.jit.si`).
- CMS: APIهای `/api/posts` و `/api/faq` با صفحات مدیریتی.

## راه‌اندازی Prisma (اختیاری)

برای مهاجرت به پایگاه‌داده واقعی (SQLite/PG) با Prisma:

1) نصب پکیج‌ها و ساخت کلاینت:

```bash
npm install
npx prisma generate
# ایجاد دیتابیس SQLite و جدول‌ها
npx prisma migrate dev --name init
```

2) فعال‌سازی استفاده از Prisma در Runtime:

در `.env.local` مقدار زیر را تنظیم کنید:

```
USE_PRISMA=1
DATABASE_URL="file:./prisma/dev.db"
```

برنامه به صورت خودکار از Prisma استفاده می‌کند؛ در غیر این‌صورت از JSON fallback استفاده می‌شود.

## بهبودهای پیشنهادی (گام‌های بعدی)

- مهاجرت دیتاستور به Prisma + PostgreSQL/SQLite
- پرداخت آنلاین برای رزرو نوبت
- نوتیفیکیشن (ایمیل/اس‌ام‌اس) تایید نوبت
- تماس ویدئویی (WebRTC) با سیگنالینگ امن یا ادغام Jitsi/Zoom (نسخه ساده Jitsi آماده است)
- پنل محتوایی (مقالات/بلاگ، سوالات متداول)

## پیکربندی‌ها

- `NEXT_PUBLIC_BASE_URL` را در `.env.local` برای SSR ثابت در تولید تنظیم کنید. پیش‌فرض توسعه `http://localhost:3000` است.
- `USE_PRISMA=1` برای استفاده از دیتابیس Prisma (اختیاری)
- `DATABASE_URL` مسیر دیتابیس Prisma (برای SQLite/PG)
- `JITSI_DOMAIN` دامنه Jitsi (پیش‌فرض `meet.jit.si`)
- `SMS_PROVIDER` مقدار `smsir` برای فعال‌سازی ارسال پیامک واقعی (در غیر این‌صورت mock)
- `SMSIR_SEND_URL` آدرس endpoint ارسال پیامک در پنل sms.ir (طبق مستندات سرویس شما)
- `SMSIR_API_KEY` کلید API برای هدر (مانند `x-api-key`) یا Authorization بر حسب پنل
- `SMSIR_LINE_NUMBER` شماره خط ارسال (در صورت نیاز)
- `SMSIR_AUTH_BEARER` اگر مقدار `1` باشد، کلید به صورت `Authorization: Bearer <key>` ارسال می‌شود
- `SMSIR_HEADER_NAME` در صورت نیاز به هدر سفارشی (پیش‌فرض: `x-api-key`)
- `SMSIR_PARAM_CODE_NAME` نام پارامتر کد در قالب (ultra-fast)
- `SMSIR_INCLUDE_TTL` اگر `0` باشد، پارامتر TTL به قالب اضافه نمی‌شود
- `REQUIRE_SAME_ORIGIN=1` الزام ارسال درخواست‌ها از یک Origin برابر با `NEXT_PUBLIC_BASE_URL` برای امنیت بیشتر
- `LOGIN_MAX_ATTEMPTS` حداکثر تلاش ورود در ۱۰ دقیقه (پیش‌فرض ۲۰)
- `OTP_MAX_ATTEMPTS` حداکثر تلاش وارد کردن کد (پیش‌فرض ۵)
- `ENABLE_ADMIN_TEST_ROUTES=0` غیرفعال کردن مسیرهای تست ادمین در تولید

توجه: ساختار دقیق payload و هدرها باید مطابق مستندات sms.ir شما تنظیم شود. در فایل `lib/sms.ts` می‌توانید در صورت لزوم کلیدها را تغییر دهید (ultra-fast/verify/bulk).

## ثبت‌نام OTP چگونه کار می‌کند؟

- درخواست کد: `POST /api/auth/otp/request` با بدنه `{ phone }` (اعتبارسنجی شماره و ارسال SMS)
- تایید کد: `POST /api/auth/otp/verify` با بدنه `{ phone, code }` (بازگرداندن `ticket`)
- تکمیل ثبت‌نام: `POST /api/auth/register` با بدنه `{ name, email, phone, password, otpTicket }`
- صفحه `register` به صورت ۳ مرحله‌ای پیاده‌سازی شده است.

موفق باشید 🌱
