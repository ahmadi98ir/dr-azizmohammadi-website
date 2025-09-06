export default function ContactPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">تماس با ما</h1>
      <p className="text-gray-600 mt-2">برای دریافت نوبت سریع، از بخش ثبت‌نام استفاده کنید.</p>
      <div className="card p-6 mt-6 grid gap-3">
        <label className="text-sm">نام و نام خانوادگی</label>
        <input className="border rounded-lg px-3 py-2" placeholder="نام شما" />
        <label className="text-sm">ایمیل</label>
        <input className="border rounded-lg px-3 py-2" placeholder="ایمیل شما" />
        <label className="text-sm">پیام</label>
        <textarea className="border rounded-lg px-3 py-2 min-h-32" placeholder="متن پیام..." />
        <button className="btn btn-primary w-fit">ارسال</button>
      </div>
    </div>
  );
}

