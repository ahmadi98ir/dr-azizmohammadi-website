export default function ServicesPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">خدمات ما</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="card p-5">
          <h3 className="font-semibold">ترک اعتیاد</h3>
          <p className="text-sm text-gray-600">برنامه درمانی شخصی‌سازی‌شده و پیگیری مستمر.</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">مشاوره خانواده</h3>
          <p className="text-sm text-gray-600">بهبود ارتباطات و مدیریت تعارض.</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">ویزیت آنلاین</h3>
          <p className="text-sm text-gray-600">حضوری، ویدئویی یا چت متنی.</p>
        </div>
      </div>
    </div>
  );
}

