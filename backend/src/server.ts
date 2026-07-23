import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prisma.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

const seedContent = [
  {
    id: 'content-1',
    title: 'Studio Session',
    slug: 'studio-session',
    description: 'A cinematic experience with premium lighting and editorial pacing.',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    category: 'Premium',
    createdAt: '2026-07-01T10:00:00.000Z'
  },
  {
    id: 'content-2',
    title: 'Night Pulse',
    slug: 'night-pulse',
    description: 'A modern release with moody colorgrading and a strong narrative flow.',
    thumbnail: 'https://images.unsplash.com/photo-1516280030429-27679b3dc8eb?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    category: 'Curated',
    createdAt: '2026-07-10T10:00:00.000Z'
  },
  {
    id: 'content-3',
    title: 'Afterglow',
    slug: 'afterglow',
    description: 'An intimate collection designed for premium discovery and retention.',
    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    category: 'Lifestyle',
    createdAt: '2026-07-14T10:00:00.000Z'
  }
];

const users: Array<{ id: string; email: string; passwordHash: string; name: string; role: string }> = [];

async function getContentItems() {
  try {
    const items = await prisma.content.findMany({
      include: { category: true },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      thumbnail: item.thumbnail ?? undefined,
      videoUrl: item.videoUrl,
      category: item.category?.name ?? 'General',
      createdAt: item.createdAt.toISOString()
    }));
  } catch {
    return seedContent;
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'adult-platform-backend' });
});

app.get('/api/content', async (_req, res) => {
  const items = await getContentItems();
  res.json(items);
});

app.get('/api/content/:slug', async (req, res) => {
  const items = await getContentItems();
  const item = items.find((entry) => entry.slug === req.params.slug);
  if (!item) {
    return res.status(404).json({ message: 'Content not found' });
  }
  return res.json(item);
});

app.get('/api/categories', async (_req, res) => {
  const items = await getContentItems();
  const categories = Array.from(new Set(items.map((item) => item.category)));
  res.json(categories.map((name) => ({ name })));
});

app.get('/api/search', async (req, res) => {
  const query = String(req.query.q || '').toLowerCase();
  const items = await getContentItems();
  const filtered = items.filter((item) => {
    const haystack = `${item.title} ${item.description} ${item.category}`.toLowerCase();
    return haystack.includes(query);
  });
  res.json(filtered);
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existing = users.find((user) => user.email === email);
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: `user-${users.length + 1}`,
    email,
    passwordHash,
    name: name || email.split('@')[0],
    role: 'USER'
  };
  users.push(user);

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find((entry) => entry.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.get('/api/admin/analytics', async (_req, res) => {
  const items = await getContentItems();
  res.json({
    totalContent: items.length,
    categories: Array.from(new Set(items.map((item) => item.category))).length,
    avgViews: 1280,
    engagementRate: '8.2%'
  });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
