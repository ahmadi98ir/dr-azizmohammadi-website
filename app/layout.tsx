import './globals.css';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getSessionUser } from '@/lib/session';

export const metadata = {
  title: 'کلینیک ترک اعتیاد و مشاوره خانواده | دکتر سید مجید عزیزمحمدی',
  description:
    'ویزیت آنلاین، مشاوره روانشناسی، برنامه درمانی ترک اعتیاد، و پیگیری بیماران به صورت آنلاین.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_token')?.value || '';
  const user = await getSessionUser(sessionCookie);

  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* Vazirmatn font */}
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="border-b bg-white">
          <nav className="container flex h-16 items-center gap-6">
            <Link href="/" className="font-bold text-primary-700">
              کلینیک دکتر عزیزمحمدی
            </Link>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Link href="/services" className="text-sm text-gray-700 hover:text-gray-900">
                خدمات
              </Link>
              <Link href="/about" className="text-sm text-gray-700 hover:text-gray-900">
                درباره ما
              </Link>
              <Link href="/blog" className="text-sm text-gray-700 hover:text-gray-900">
                مقالات
              </Link>
              <Link href="/faq" className="text-sm text-gray-700 hover:text-gray-900">
                سوالات متداول
              </Link>
              <Link href="/contact" className="text-sm text-gray-700 hover:text-gray-900">
                تماس
              </Link>
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link href="/admin" className="btn btn-outline text-sm">
                      مدیریت
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="btn btn-outline text-sm">
                      پنل بیمار
                    </Link>
                  )}
                  <form action="/api/auth/logout" method="post">
                    <button className="btn btn-primary text-sm" type="submit">
                      خروج
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-outline text-sm">
                    ورود
                  </Link>
                  <Link href="/register" className="btn btn-primary text-sm">
                    ثبت نام
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="min-h-[calc(100vh-10rem)]">{children}</main>
        <footer className="border-t bg-white mt-10">
          <div className="container py-8 text-sm text-gray-600">
            © {new Date().getFullYear()} همه حقوق محفوظ است — کلینیک دکتر سید مجید عزیزمحمدی
          </div>
        </footer>
      </body>
    </html>
  );
}
