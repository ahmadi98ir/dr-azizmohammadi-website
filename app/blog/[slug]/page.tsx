import { getPostBySlug } from '@/lib/cms';

export default async function PostPage({ params }: any) {
  const post = await getPostBySlug(params.slug);
  if (!post || !post.published) return <div className="container py-10">یافت نشد</div>;
  return (
    <div className="container py-10 prose prose-slate max-w-none">
      <h1>{post.title}</h1>
      <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString('fa-IR')}</p>
      <div className="whitespace-pre-wrap mt-6">{post.content}</div>
    </div>
  );
}
