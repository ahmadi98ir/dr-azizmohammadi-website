import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { FaqItem, Post } from './types';
import { uid, toISO } from './utils';

const dataDir = path.join(process.cwd(), 'data');
const postsFile = path.join(dataDir, 'posts.json');
const faqFile = path.join(dataDir, 'faq.json');

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const data = await readFile(file, 'utf8');
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}
async function writeJson<T>(file: string, data: T) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

export async function listPosts(): Promise<Post[]> {
  return readJson<Post[]>(postsFile, []);
}
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const items = await listPosts();
  return items.find((p) => p.slug === slug) || null;
}
export async function createPost(input: { title: string; slug: string; content: string; published?: boolean }) {
  const items = await listPosts();
  const post: Post = {
    id: uid('post_'),
    title: input.title,
    slug: input.slug,
    content: input.content,
    published: !!input.published,
    createdAt: toISO(Date.now()),
  };
  items.push(post);
  await writeJson(postsFile, items);
  return post;
}
export async function updatePost(id: string, patch: Partial<Post>) {
  const items = await listPosts();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  await writeJson(postsFile, items);
  return items[idx];
}

export async function listFaq(): Promise<FaqItem[]> {
  return readJson<FaqItem[]>(faqFile, []);
}
export async function createFaq(input: { question: string; answer: string }) {
  const items = await listFaq();
  const f: FaqItem = { id: uid('faq_'), question: input.question, answer: input.answer, createdAt: toISO(Date.now()) };
  items.push(f);
  await writeJson(faqFile, items);
  return f;
}
export async function updateFaq(id: string, patch: Partial<FaqItem>) {
  const items = await listFaq();
  const idx = items.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  await writeJson(faqFile, items);
  return items[idx];
}

