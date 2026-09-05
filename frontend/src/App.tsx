import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Bookmark, Clock3, Compass, Film, Heart, Home as HomeIcon, LayoutGrid, LogOut, Menu, Search, ShieldCheck, Sparkles, Tags, UserRound, X } from 'lucide-react';

import { getCategories } from './api/categories.js';
import { useAuth } from './auth/AuthContext.js';
import LoginPage from './auth/Login.js';
import RegisterPage from './auth/Register.js';
import RequireAdmin from './auth/RequireAdmin.js';
import { getContents, getContentById } from './api/contents.js';
import { getLikes, createLike, deleteLike, getLikeCount, getLikeStatus } from './api/likes.js';
import { getFavorites, createFavorite, deleteFavorite } from './api/favorites.js';
import { getTags } from './api/tags.js';
import { getCommentsByContent, createComment, deleteComment } from './api/comments.js';
import { getWatchHistory, addToWatchHistory, deleteWatchHistoryItem, clearWatchHistory } from './api/watchHistory.js';
import AdminDashboard from './admin/AdminDashboard.js';
import { getThumbnailUrl } from './utils/cloudinary.js';
import Seo, { DEFAULT_DESCRIPTION, getSiteUrl, trimDescription } from './seo/Seo.js';
import type { Category, Comment, Content, Tag, WatchHistoryItem } from './types/api.js';

function StateMessage({
  kind,
  children,
}: {
  kind: 'loading' | 'error' | 'empty' | 'success';
  children: React.ReactNode;
}) {
  const styles = {
    loading: 'border-white/10 bg-white/[0.04] text-slate-400',
    error: 'border-red-400/20 bg-red-400/10 text-red-200',
    empty: 'border-white/10 bg-white/[0.04] text-slate-400',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  }[kind];

  return <div className={`rounded-2xl border px-4 py-4 text-sm ${styles}`} role={kind === 'error' ? 'alert' : undefined}>{children}</div>;
}

function ContentCard({ item }: { item: Content }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/40 hover:bg-slate-900">
      <Link to={`/content/${item.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-inset">
        <div className="relative aspect-video overflow-hidden bg-slate-800">
          <img
            src={getThumbnailUrl(item.thumbnail) || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80'}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent" />
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-fuchsia-300">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            {item.category?.name || item.categoryId}
          </div>
          <h3 className="mt-3 line-clamp-2 min-h-[3.5rem] text-xl font-semibold leading-7 text-white">{item.title}</h3>
          <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-400">{item.description}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-200 transition group-hover:text-fuchsia-200">
            Open details <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </article>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
            <Link to="/" onClick={closeMenu} className="flex shrink-0 items-center gap-3 text-xl font-bold tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-400/30"><Film className="h-5 w-5" /></span>
              <span>Luxe<span className="text-fuchsia-300">Verse</span></span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <PrimaryNav onNavigate={closeMenu} />
              <AuthNav onNavigate={closeMenu} />
            </div>
            <button type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:border-fuchsia-400/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 md:hidden">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {menuOpen && (
            <div className="border-t border-white/10 pb-4 pt-3 md:hidden">
              <div className="grid gap-1 text-sm text-slate-300">
                <PrimaryNav onNavigate={closeMenu} mobile />
                <AuthNav onNavigate={closeMenu} mobile />
              </div>
            </div>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-14">{children}</main>
    </div>
  );
}

function PrimaryNav({ onNavigate, mobile = false }: { onNavigate: () => void; mobile?: boolean }) {
  const linkClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-2 rounded-xl px-3 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${isActive ? 'bg-fuchsia-500/15 text-fuchsia-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'} ${mobile ? 'w-full' : ''}`;

  return (
    <>
      <NavLink to="/" onClick={onNavigate} className={linkClass}><HomeIcon className="h-4 w-4" />Home</NavLink>
      <NavLink to="/categories" onClick={onNavigate} className={linkClass}><LayoutGrid className="h-4 w-4" />Categories</NavLink>
      <NavLink to="/search" onClick={onNavigate} className={linkClass}><Search className="h-4 w-4" />Search</NavLink>
    </>
  );
}

function HomePage() {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getContents({ limit: 6 });
        if (active) {
          setItems(response.data);
        }
      } catch (err) {
        if (active) {
          setItems([]);
          setError(err instanceof Error ? err.message : 'Unable to load content.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      <Seo
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'LuxeVerse',
          url: getSiteUrl('/'),
        }}
      />
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-300">
            <Sparkles className="h-4 w-4" /> General video platform
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">Discover. Watch. Explore.</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">Explore films, videos and digital content across a growing collection of categories.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/categories" className="rounded-full bg-fuchsia-600 px-6 py-3 font-medium text-white transition hover:bg-fuchsia-500">Explore categories</Link>
            <Link to="/search" className="rounded-full border border-white/10 bg-slate-900 px-6 py-3 font-medium text-slate-200">Search library</Link>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8">
          <div className="mb-6 flex items-center gap-3 text-fuchsia-300">
            <ShieldCheck className="h-5 w-5" /> Organized media discovery
          </div>
          <div className="space-y-4 text-sm text-slate-400">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast search with category and tag relevance.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Flexible admin analytics for daily growth.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">SEO-ready pages and responsive layout.</div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {['Trending', 'New uploads', 'Featured categories'].map((title) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-2 flex items-center gap-2 text-fuchsia-300">
              <Compass className="h-4 w-4" /> {title}
            </div>
            <p className="text-sm text-slate-400">Find and manage films, educational videos, gaming content, technology, music and more.</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">Now showing</p><h2 className="mt-2 text-2xl font-semibold">Featured videos</h2></div>
          <Link to="/search" className="inline-flex items-center gap-1 text-sm text-fuchsia-300 transition hover:text-fuchsia-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">Browse all <ArrowRight className="h-4 w-4" /></Link>
        </div>

        {loading ? (
          <div className="mt-6"><StateMessage kind="loading">Loading content…</StateMessage></div>
        ) : error ? (
          <div className="mt-6"><StateMessage kind="error">{error}</StateMessage></div>
        ) : items.length === 0 ? (
          <div className="mt-6"><StateMessage kind="empty">No videos available right now. Check back soon for new additions.</StateMessage></div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => <ContentCard key={item.id} item={item} />)}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCategories();
        if (active) {
          setCategories(response.data);
        }
      } catch (err) {
        if (active) {
          setCategories([]);
          setError(err instanceof Error ? err.message : 'Unable to load categories.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      <Seo
        title="Categories | LuxeVerse"
        description="Browse LuxeVerse categories to discover videos, films and digital content."
        canonicalPath="/categories"
      />
      <h1 className="sr-only">Categories</h1>
      {loading ? (
        <p className="text-slate-400">Loading categories…</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : categories.length === 0 ? (
        <p className="text-slate-400">No categories found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center gap-2 text-fuchsia-300"><LayoutGrid className="h-4 w-4" />{category.name}</div>
              <p className="text-sm text-slate-400">Explore videos and films organized for faster discovery across the platform.</p>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Content[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadTags = async () => {
      try {
        const response = await getTags();
        if (active) {
          setTags(response.data);
        }
      } catch {
        if (active) {
          setTags([]);
        }
      }
    };

    loadTags();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getContents({
          search: query.trim(),
          limit: 10,
        });

        if (active) {
          setResults(response.data);
        }
      } catch (err) {
        if (active) {
          setResults([]);
          setError(err instanceof Error ? err.message : 'Unable to load search results.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const timeout = window.setTimeout(() => {
      if (query.trim()) {
        loadResults();
        return;
      }

      setResults([]);
      setLoading(false);
      setError(null);
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [query]);

  return (
    <AppShell>
      <Seo
        title="Search | LuxeVerse"
        description="Search the LuxeVerse library by title, description, category, or tag."
        canonicalPath="/search"
      />
      <h1 className="sr-only">Search LuxeVerse content</h1>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <label className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 focus-within:border-fuchsia-400/60 focus-within:ring-2 focus-within:ring-fuchsia-400/20">
          <Search className="h-4 w-4" />
          <input aria-label="Search content" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Search by title, description or category" />
        </label>

        {tags.length > 0 && !query && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.slice(0, 8).map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setQuery(tag.slug)}
                className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <StateMessage kind="loading">Searching…</StateMessage>
        ) : error ? (
          <StateMessage kind="error">{error}</StateMessage>
        ) : results.length === 0 ? (
          <StateMessage kind="empty">No matching results found. Try another title, category, or tag.</StateMessage>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                <div className="flex items-center gap-2 text-fuchsia-300"><Tags className="h-4 w-4" />{item.category?.name || item.categoryId}</div>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function AdminPage() {
  const [analytics, setAnalytics] = useState<{ totalContent: number; categories: number; avgViews: number; engagementRate: string } | null>(null);
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/admin/analytics`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          setAnalytics(null);
        }
      } catch {
        setAnalytics(null);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <AppShell>
      <Seo
        title="Admin Dashboard | LuxeVerse"
        description="Manage LuxeVerse content, categories, tags, and platform analytics."
        canonicalPath="/admin"
        robots="noindex,nofollow"
      />
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [item, setItem] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const trackedContentRef = useRef<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [loadingLikeAction, setLoadingLikeAction] = useState(false);
  const [loadingFavAction, setLoadingFavAction] = useState(false);

  useEffect(() => {
    let active = true;

    const loadItem = async () => {
      if (!id) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getContentById(id);
        if (active) {
          setItem(response.data);
        }
      } catch (err) {
        if (active) {
          setItem(null);
          setError(err instanceof Error ? err.message : 'Unable to load content.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadItem();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !isAuthenticated || !item) return;

    if (trackedContentRef.current === id) return;

    trackedContentRef.current = id;

    addToWatchHistory(id).catch(() => {
      trackedContentRef.current = null;
    });
  }, [id, isAuthenticated, item]);

  useEffect(() => {
    let active = true;

    const loadComments = async () => {
      if (!id) return;

      setCommentsLoading(true);
      setCommentsError(null);

      try {
        const response = await getCommentsByContent(id);
        if (active) {
          setComments(response.data ?? []);
        }
      } catch (err) {
        if (active) {
          setComments([]);
          setCommentsError(err instanceof Error ? err.message : 'Unable to load comments.');
        }
      } finally {
        if (active) {
          setCommentsLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;

    const loadInteractions = async () => {
      if (!id) return;

      // like count (public)
      try {
        const res = await getLikeCount(id);
        const count = (res && (res as any).data && (res as any).data.count) ?? 0;
        if (active) setLikesCount(Number(count));
      } catch {
        if (active) setLikesCount(0);
      }

      if (!isAuthenticated) return;

      try {
        const statusRes = await getLikeStatus(id);
        const likedFlag = Boolean((statusRes as any).data?.liked);
        if (active) setLiked(likedFlag);
      } catch {
        if (active) setLiked(false);
      }

      try {
        const likesRes = await getLikes();
        const list = (likesRes as any).data ?? [];
        const found = list.find((l: any) => l.contentId === id);
        if (active && found) setLikeId(found.id);
      } catch {
        // ignore
      }

      try {
        const favRes = await getFavorites();
        const favList = (favRes as any).data ?? [];
        const foundFav = favList.find((f: any) => f.contentId === id || f.content?.id === id);
        if (active && foundFav) {
          setFavoriteId(foundFav.id);
          setFavorited(true);
        }
      } catch {
        // ignore
      }
    };

    loadInteractions();

    return () => {
      active = false;
    };
  }, [id, isAuthenticated]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!id) return;
    if (loadingLikeAction) return;

    setLoadingLikeAction(true);
    const prevLiked = liked;
    const prevCount = likesCount ?? 0;

    if (!liked) {
      // optimistic
      setLiked(true);
      setLikesCount(prevCount + 1);
      try {
        const res = await createLike(id);
        const newId = (res as any).data?.id ?? (res as any)?.id ?? null;
        setLikeId(newId);
      } catch (err) {
        setLiked(prevLiked);
        setLikesCount(Math.max(0, prevCount));
      } finally {
        setLoadingLikeAction(false);
      }
    } else {
      // unlike
      setLiked(false);
      setLikesCount(Math.max(0, prevCount - 1));
      try {
        let idToDelete = likeId;
        if (!idToDelete) {
          const likesRes = await getLikes();
          const found = (likesRes as any).data?.find((l: any) => l.contentId === id);
          idToDelete = found?.id;
        }
        if (idToDelete) {
          await deleteLike(idToDelete);
          setLikeId(null);
        }
      } catch (err) {
        setLiked(prevLiked);
        setLikesCount(prevCount);
      } finally {
        setLoadingLikeAction(false);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!id) return;
    if (loadingFavAction) return;

    setLoadingFavAction(true);
    const prevFav = favorited;

    if (!favorited) {
      // optimistic
      setFavorited(true);
      try {
        const res = await createFavorite(id);
        const newId = (res as any).data?.id ?? (res as any)?.id ?? null;
        setFavoriteId(newId);
      } catch {
        setFavorited(prevFav);
      } finally {
        setLoadingFavAction(false);
      }
    } else {
      setFavorited(false);
      try {
        let idToDelete = favoriteId;
        if (!idToDelete) {
          const favRes = await getFavorites();
          const found = (favRes as any).data?.find((f: any) => f.contentId === id || f.content?.id === id);
          idToDelete = found?.id;
        }
        if (idToDelete) {
          await deleteFavorite(idToDelete);
          setFavoriteId(null);
        }
      } catch {
        setFavorited(prevFav);
      } finally {
        setLoadingFavAction(false);
      }
    }
  };

  const handleCreateComment = async () => {
    if (!id) return;
    const trimmed = commentInput.trim();

    if (!trimmed) {
      setCommentError('Comment cannot be empty.');
      return;
    }

    if (trimmed.length > 2000) {
      setCommentError('Comment must be 2000 characters or fewer.');
      return;
    }

    setSubmittingComment(true);
    setCommentError(null);

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      userId: user?.id ?? 'me',
      contentId: id,
      body: trimmed,
      createdAt: new Date().toISOString(),
      user: user ? {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar ?? null,
      } : null,
    } as Comment;

    setComments((current) => [optimisticComment, ...current]);
    setCommentInput('');

    try {
      const response = await createComment(id, trimmed);
      const createdComment = response.data;
      setComments((current) => current.map((comment) => comment.id === optimisticComment.id ? createdComment : comment));
    } catch (err) {
      setComments((current) => current.filter((comment) => comment.id !== optimisticComment.id));
      setCommentError(err instanceof Error ? err.message : 'Unable to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;

    const previousComments = comments;
    const target = comments.find((comment) => comment.id === commentId);
    setDeletingCommentId(commentId);
    setComments((current) => current.filter((comment) => comment.id !== commentId));
    setCommentError(null);

    try {
      await deleteComment(commentId);
    } catch (err) {
      setComments(previousComments);
      setCommentError(err instanceof Error ? err.message : 'Unable to delete comment.');
    } finally {
      setDeletingCommentId((current) => (current === commentId ? null : current));
    }
  };

  const canDeleteComment = (comment: Comment) => {
    if (!user) return false;
    return user.id === comment.userId || isAdmin;
  };

  const formatCommentDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Just now';
    }

    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const detailDescription = trimDescription(item?.description, 160);
  const detailImage = item?.thumbnail ? getThumbnailUrl(item.thumbnail) : undefined;
  const detailStructuredData = item ? {
    '@context': 'https://schema.org',
    '@type': item.videoUrl ? 'VideoObject' : 'CreativeWork',
    name: item.title,
    description: detailDescription,
    ...(detailImage ? { thumbnailUrl: detailImage } : {}),
    ...(item.createdAt ? { uploadDate: item.createdAt } : {}),
    ...(item.videoUrl ? { contentUrl: item.videoUrl } : {}),
    url: getSiteUrl(`/content/${item.id}`),
  } : null;

  return (
    <AppShell>
      <Seo
        title={item?.title ? `${item.title} | LuxeVerse` : 'Content | LuxeVerse'}
        description={item?.description || DEFAULT_DESCRIPTION}
        canonicalPath={id ? `/content/${id}` : '/content'}
        image={detailImage}
        type={item?.videoUrl ? 'video.other' : 'website'}
        structuredData={detailStructuredData}
      />
      {loading ? (
        <p className="text-slate-400">Loading content…</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : item ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-fuchsia-300"><span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1">{item.category?.name || item.categoryId}</span><span className="text-slate-500">LuxeVerse original</span></div>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl">{item.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">{item.description}</p>
          {item.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map(({ tag }) => (
                <span key={tag.id} className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
          {item.videoUrl && (
            <div className="mx-auto mt-8 w-full max-w-[960px] overflow-hidden rounded-2xl border border-white/10 bg-black">
              <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
                <video
                  key={item.videoUrl}
                  controls
                  preload="metadata"
                  playsInline
                  className="h-full w-full object-contain"
                >
                  <source src={item.videoUrl} />
                </video>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleToggleLike()}
              disabled={loadingLikeAction}
              aria-label={liked ? 'Unlike this content' : 'Like this content'}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 disabled:cursor-wait disabled:opacity-50 ${liked ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-100' : 'border-white/10 bg-slate-900 text-slate-200 hover:border-white/25'}`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} /> {liked ? 'Liked' : 'Like'}{likesCount !== null ? ` (${likesCount})` : ''}
            </button>

            <button
              type="button"
              onClick={() => void handleToggleFavorite()}
              disabled={loadingFavAction}
              aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 disabled:cursor-wait disabled:opacity-50 ${favorited ? 'bg-fuchsia-600 text-white' : 'border border-white/10 bg-slate-900 text-slate-200 hover:border-white/25'}`}
            >
              <Bookmark className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} /> {favorited ? 'Saved' : 'Save'}
            </button>
          </div>

          <section className="mt-10 rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Comments</h2>
              <span className="text-sm text-slate-400">{comments.length} total</span>
            </div>

            {!isAuthenticated ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                <span>Sign in to leave a comment</span>
                <Link to="/login" className="ml-2 font-medium text-fuchsia-300 hover:text-fuchsia-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">Log in</Link>
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <textarea
                  value={commentInput}
                  onChange={(event) => setCommentInput(event.target.value)}
                  placeholder="Share your thoughts..."
                  maxLength={2000}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-fuchsia-500"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">{commentInput.trim().length}/2000</span>
                  <button
                    type="button"
                    onClick={() => void handleCreateComment()}
                    disabled={submittingComment || commentInput.trim().length === 0}
                    className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-fuchsia-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingComment ? 'Posting...' : 'Submit Comment'}
                  </button>
                </div>
                {commentError && <p className="mt-3 text-sm text-red-400">{commentError}</p>}
              </div>
            )}

            {commentsLoading ? (
              <p className="text-slate-400">Loading comments…</p>
            ) : commentsError ? (
              <p className="text-red-400">{commentsError}</p>
            ) : comments.length === 0 ? (
              <StateMessage kind="empty">No comments yet. Be the first to share your thoughts.</StateMessage>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{comment.user?.name || comment.user?.username || 'Anonymous'}</p>
                        <p className="text-xs text-slate-400">{formatCommentDate(comment.createdAt)}</p>
                      </div>

                      {canDeleteComment(comment) && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          className="text-xs font-medium text-red-300 hover:text-red-200 disabled:opacity-50"
                        >
                          {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{comment.body}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <p className="text-slate-400">Content not found.</p>
      )}
    </AppShell>
  );
}

function HistoryPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      setActionError(null);

      try {
        const response = await getWatchHistory();
        if (active) {
          setItems(response.data ?? []);
        }
      } catch (err) {
        if (active) {
          setItems([]);
          setError(err instanceof Error ? err.message : 'Unable to load watch history.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <AppShell>
        <p className="text-slate-400">Loading…</p>
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleRemove = async (id: string) => {
    const previous = items;
    setRemovingId(id);
    setActionError(null);
    setItems((current) => current.filter((item) => item.id !== id));

    try {
      await deleteWatchHistoryItem(id);
    } catch (err) {
      setItems(previous);
      setActionError(err instanceof Error ? err.message : 'Unable to remove history item.');
    } finally {
      setRemovingId((current) => (current === id ? null : current));
    }
  };

  const handleClear = async () => {
    if (items.length === 0) return;

    const confirmed = window.confirm('Clear your entire watch history?');
    if (!confirmed) return;

    const previous = items;
    setActionError(null);
    setItems([]);

    try {
      await clearWatchHistory();
    } catch (err) {
      setItems(previous);
      setActionError(err instanceof Error ? err.message : 'Unable to clear watch history.');
    }
  };

  return (
    <AppShell>
      <Seo
        title="Watch History | LuxeVerse"
        description="Review and manage the content you have watched on LuxeVerse."
        canonicalPath="/history"
        robots="noindex,nofollow"
      />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Watch History</h1>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => void handleClear()}
              className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-slate-200"
            >
              Clear history
            </button>
          )}
        </div>

        {actionError && <p className="mb-4 text-sm text-red-400">{actionError}</p>}

        {loading ? (
          <p className="text-slate-400">Loading watch history…</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-slate-400">No watch history yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <Link to={`/content/${entry.contentId}`} className="block w-full overflow-hidden rounded-xl bg-slate-800 md:w-44">
                    {entry.content.thumbnail ? (
                      <img src={getThumbnailUrl(entry.content.thumbnail)} alt={entry.content.title} className="h-full w-full object-cover" style={{ aspectRatio: '16 / 9' }} />
                    ) : (
                      <div className="flex h-28 items-center justify-center text-sm text-slate-400">No image</div>
                    )}
                  </Link>

                  <div className="flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm text-fuchsia-300">{entry.content.category?.name || entry.content.categoryId}</p>
                        <Link to={`/content/${entry.contentId}`} className="mt-1 block text-xl font-semibold text-white hover:text-fuchsia-200">
                          {entry.content.title}
                        </Link>
                        <p className="mt-2 text-sm text-slate-400">{entry.content.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleRemove(entry.id)}
                        disabled={removingId === entry.id}
                        className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 disabled:opacity-50"
                      >
                        {removingId === entry.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>

                    {entry.content.tags && entry.content.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {entry.content.tags.map(({ tag }) => (
                          <span key={tag.id} className="rounded-full border border-white/10 bg-slate-950 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300">
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-3 text-xs text-slate-400">
                      Watched {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function App() {
  return (
    <>
      <Seo />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/content/:id" element={<ContentDetailPage />} />
      </Routes>
    </>
  );
}

function AuthNav({ onNavigate, mobile = false }: { onNavigate: () => void; mobile?: boolean }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const linkClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-2 rounded-xl px-3 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${isActive ? 'bg-fuchsia-500/15 text-fuchsia-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'} ${mobile ? 'w-full' : ''}`;

  if (!isAuthenticated) {
    return (
      <>
        <NavLink to="/login" onClick={onNavigate} className={linkClass}><UserRound className="h-4 w-4" />Login</NavLink>
        <NavLink to="/register" onClick={onNavigate} className={linkClass}><Sparkles className="h-4 w-4" />Register</NavLink>
      </>
    );
  }

  return (
    <>
      {isAdmin && (
        <NavLink to="/admin" onClick={onNavigate} className={linkClass}><BarChart3 className="h-4 w-4" />Admin</NavLink>
      )}
      <NavLink to="/history" onClick={onNavigate} className={linkClass}><Clock3 className="h-4 w-4" />History</NavLink>
      <div className={`flex items-center gap-2 ${mobile ? 'mt-2 border-t border-white/10 px-3 pt-3' : 'ml-2 border-l border-white/10 pl-3'}`}>
        <span className="max-w-28 truncate text-sm text-slate-200" title={user?.name || user?.username || 'Account'}>{user?.name || user?.username}</span>
        <button type="button" onClick={() => { onNavigate(); void logout(); }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"><LogOut className="h-4 w-4" />Logout</button>
      </div>
    </>
  );
}

export default App;
