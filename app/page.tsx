import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container py-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-10">
            کلینیک ترک اعتیاد و مشاوره خانواده
            <br />
            <span className="text-primary-700">دکتر سید مجید عزیزمحمدی</span>
          </h1>
          <p className="mt-4 text-gray-700 leading-8">
            ارائه برنامه درمانی، ویزیت آنلاین، پیگیری مستمر بیماران و مشاوره تخصصی خانواده.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/register" className="btn btn-primary">
              شروع نوبت‌گیری آنلاین
            </Link>
            <Link href="/services" className="btn btn-outline">
              آشنایی با خدمات
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-4 text-sm text-gray-700">
            <li className="card p-4">ویزیت آنلاین با ویدئو/چت</li>
            <li className="card p-4">برنامه درمانی ترک اعتیاد</li>
            <li className="card p-4">مشاوره زوج و خانواده</li>
            <li className="card p-4">پیگیری و پشتیبانی بیمار</li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-lg">نوبت سریع</h2>
          <p className="text-sm text-gray-600 mt-2">
            بدون تماس تلفنی، نوبت خود را آنلاین رزرو کنید.
          </p>
          <form action="/register" className="mt-6 grid gap-3">
            <input className="border rounded-lg px-3 py-2" placeholder="نام و نام خانوادگی" />
            <input className="border rounded-lg px-3 py-2" placeholder="ایمیل" />
            <button className="btn btn-primary" type="submit">
              ادامه به ثبت‌نام
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4">
            برای رزرو نوبت لازم است ابتدا حساب کاربری ایجاد کنید.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-bold">چرا کلینیک ما؟</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="card p-5">
            <h3 className="font-semibold">پروتکل‌های علمی و به‌روز</h3>
            <p className="text-sm text-gray-600 mt-2">
              با تکیه بر جدیدترین دستورالعمل‌ها و تجربه بالینی.
            </p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold">حفظ حریم خصوصی</h3>
            <p className="text-sm text-gray-600 mt-2">اطلاعات شما محرمانه و امن نگهداری می‌شود.</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold">پیگیری منظم</h3>
            <p className="text-sm text-gray-600 mt-2">مشاوره و پیگیری مستمر تا بهبودی پایدار.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

