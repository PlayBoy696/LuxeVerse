import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart3, Compass, Film, Home as HomeIcon, LayoutGrid, Search, ShieldCheck, Sparkles, Tags, ArrowRight } from 'lucide-react';
import type { ContentItem } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3 text-xl font-semibold">
            <Film className="h-6 w-6 text-fuchsia-500" />
            <span>LuxeVerse</span>
          </Link>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}>
              <span className="flex items-center gap-2"><HomeIcon className="h-4 w-4" />Home</span>
            </NavLink>
            <NavLink to="/categories" className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}>
              <span className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" />Categories</span>
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}>
              <span className="flex items-center gap-2"><Search className="h-4 w-4" />Search</span>
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}>
              <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Admin</span>
            </NavLink>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10 lg:py-16">{children}</main>
    </div>
  );
}

function HomePage() {
  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/content`)
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  return (
    <AppShell>
      <Helmet>
        <title>LuxeVerse | Premium content discovery</title>
        <meta name="description" content="Explore premium curated content, smart categories, and a responsive discovery experience." />
      </Helmet>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-300">
            <Sparkles className="h-4 w-4" /> Premium discovery experience
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">Discover standout content with speed and elegance.</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">A modern, responsive platform with curated categories, instant search, and a polished admin dashboard built for growth.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/categories" className="rounded-full bg-fuchsia-600 px-6 py-3 font-medium text-white transition hover:bg-fuchsia-500">Explore categories</Link>
            <Link to="/search" className="rounded-full border border-white/10 bg-slate-900 px-6 py-3 font-medium text-slate-200">Search library</Link>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8">
          <div className="mb-6 flex items-center gap-3 text-fuchsia-300">
            <ShieldCheck className="h-5 w-5" /> Verified access and smart moderation
          </div>
          <div className="space-y-4 text-sm text-slate-400">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast search with category and tag relevance.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Flexible admin analytics for daily growth.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">SEO-ready pages and responsive layout.</div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {['Trending', 'New uploads', 'Creators'].map((title) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-2 flex items-center gap-2 text-fuchsia-300">
              <Compass className="h-4 w-4" /> {title}
            </div>
            <p className="text-sm text-slate-400">The experience balances discovery, engagement, and polished presentation across every screen size.</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Fresh picks</h2>
          <Link to="/search" className="text-sm text-fuchsia-300">Browse all</Link>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
              <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${item.thumbnail || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80'})` }} />
              <div className="p-6">
                <p className="text-sm text-fuchsia-300">{item.slug}</p>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-400">{item.description}</p>
                <Link to={`/content/${item.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm text-white">
                  Open details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function CategoriesPage() {
  const [categories, setCategories] = useState<Array<{ name: string }>>([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <AppShell>
      <Helmet><title>Categories | LuxeVerse</title></Helmet>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div key={category.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center gap-2 text-fuchsia-300"><LayoutGrid className="h-4 w-4" />{category.name}</div>
            <p className="text-sm text-slate-400">Curated collections designed for faster discovery and a premium browsing experience.</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('studio');
  const [results, setResults] = useState<ContentItem[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => setResults(data))
      .catch(() => setResults([]));
  }, [query]);

  return (
    <AppShell>
      <Helmet><title>Search | LuxeVerse</title></Helmet>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <label className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Search by title, description or category" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <div className="flex items-center gap-2 text-fuchsia-300"><Tags className="h-4 w-4" />{item.category}</div>
              <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function AdminPage() {
  const [analytics, setAnalytics] = useState<{ totalContent: number; categories: number; avgViews: number; engagementRate: string } | null>(null);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/analytics`)
      .then((response) => response.json())
      .then((data) => setAnalytics(data))
      .catch(() => setAnalytics(null));
  }, []);

  return (
    <AppShell>
      <Helmet><title>Admin Panel | LuxeVerse</title></Helmet>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {analytics ? (
          <>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6"><p className="text-sm text-slate-400">Total content</p><p className="mt-3 text-3xl font-semibold">{analytics.totalContent}</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6"><p className="text-sm text-slate-400">Categories</p><p className="mt-3 text-3xl font-semibold">{analytics.categories}</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6"><p className="text-sm text-slate-400">Avg. views</p><p className="mt-3 text-3xl font-semibold">{analytics.avgViews}</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6"><p className="text-sm text-slate-400">Engagement</p><p className="mt-3 text-3xl font-semibold">{analytics.engagementRate}</p></div>
          </>
        ) : (
          <p className="text-slate-400">Analytics are loading…</p>
        )}
      </div>
    </AppShell>
  );
}

function ContentDetailPage() {
  const { slug } = useParams();
  const [item, setItem] = useState<ContentItem | null>(null);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/content/${slug}`)
      .then((response) => response.json())
      .then((data) => setItem(data))
      .catch(() => setItem(null));
  }, [slug]);

  return (
    <AppShell>
      <Helmet><title>{item?.title ? `${item.title} | LuxeVerse` : 'Content | LuxeVerse'}</title></Helmet>
      {item ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm text-fuchsia-300">{item.category}</p>
          <h1 className="mt-3 text-3xl font-semibold">{item.title}</h1>
          <p className="mt-4 max-w-2xl text-slate-400">{item.description}</p>
          <video controls className="mt-8 w-full rounded-2xl" src={item.videoUrl} />
        </div>
      ) : (
        <p className="text-slate-400">Loading content…</p>
      )}
    </AppShell>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/content/:slug" element={<ContentDetailPage />} />
    </Routes>
  );
}

export default App;
