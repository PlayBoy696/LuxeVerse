import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../seo/Seo.js';
import { Film, Pencil, Plus, Trash2, X } from 'lucide-react';

import { getContents, createContent, updateContent, deleteContent } from '../api/contents.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories.js';
import { getTags, createTag, updateTag, deleteTag } from '../api/tags.js';
import { uploadImage, uploadVideo } from '../api/uploads.js';
import type { Category, Content, Tag } from '../types/api.js';

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);

const isValidUrl = (value: string) => {
  if (!value.trim()) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

type SectionKey = 'content' | 'categories' | 'tags';

type ContentFormState = {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  categoryId: string;
  tagIds: string[];
};

const emptyContentForm = (): ContentFormState => ({
  title: '',
  slug: '',
  description: '',
  thumbnail: '',
  videoUrl: '',
  categoryId: '',
  tagIds: [],
});

type NameSlugFormState = {
  name: string;
  slug: string;
};

const emptyNameSlug = (): NameSlugFormState => ({ name: '', slug: '' });

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<SectionKey>('content');

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [contents, setContents] = useState<Content[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingContents, setLoadingContents] = useState(true);

  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [contentsError, setContentsError] = useState<string | null>(null);

  const [contentFormOpen, setContentFormOpen] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [contentDraft, setContentDraft] = useState<ContentFormState>(emptyContentForm());
  const [contentFormError, setContentFormError] = useState<string | null>(null);
  const [contentSubmitLoading, setContentSubmitLoading] = useState(false);
  const [contentSuccess, setContentSuccess] = useState<string | null>(null);
  const [contentSlugTouched, setContentSlugTouched] = useState(false);
  const [thumbnailUploadLoading, setThumbnailUploadLoading] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null);
  const [thumbnailUploadSuccess, setThumbnailUploadSuccess] = useState<string | null>(null);
  const [thumbnailSelectedFile, setThumbnailSelectedFile] = useState<string | null>(null);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [videoUploadSuccess, setVideoUploadSuccess] = useState<string | null>(null);
  const [videoSelectedFile, setVideoSelectedFile] = useState<string | null>(null);

  const [categoryDraft, setCategoryDraft] = useState<NameSlugFormState>(emptyNameSlug());
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const [categorySubmitLoading, setCategorySubmitLoading] = useState(false);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);
  const [categorySlugTouched, setCategorySlugTouched] = useState(false);

  const [tagDraft, setTagDraft] = useState<NameSlugFormState>(emptyNameSlug());
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagFormError, setTagFormError] = useState<string | null>(null);
  const [tagSubmitLoading, setTagSubmitLoading] = useState(false);
  const [tagSuccess, setTagSuccess] = useState<string | null>(null);
  const [tagSlugTouched, setTagSlugTouched] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const tagMap = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    setCategoriesError(null);
    try {
      const response = await getCategories();
      setCategories(response.data ?? []);
    } catch (err) {
      setCategoriesError(err instanceof Error ? err.message : 'Unable to load categories.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadTags = async () => {
    setLoadingTags(true);
    setTagsError(null);
    try {
      const response = await getTags();
      setTags(response.data ?? []);
    } catch (err) {
      setTagsError(err instanceof Error ? err.message : 'Unable to load tags.');
    } finally {
      setLoadingTags(false);
    }
  };

  const loadContents = async () => {
    setLoadingContents(true);
    setContentsError(null);
    try {
      const response = await getContents({ limit: 100 });
      setContents(response.data ?? []);
    } catch (err) {
      setContentsError(err instanceof Error ? err.message : 'Unable to load content.');
    } finally {
      setLoadingContents(false);
    }
  };

  useEffect(() => {
    void loadCategories();
    void loadTags();
    void loadContents();
  }, []);

  const openContentCreate = () => {
    setEditingContentId(null);
    setContentFormError(null);
    setContentSuccess(null);
    setContentSlugTouched(false);
    setContentDraft(emptyContentForm());
    setContentFormOpen(true);
  };

  const openContentEdit = (item: Content) => {
    setEditingContentId(item.id);
    setContentFormError(null);
    setContentSuccess(null);
    setContentSlugTouched(true);
    setContentDraft({
      title: item.title,
      slug: item.slug,
      description: item.description,
      thumbnail: item.thumbnail ?? '',
      videoUrl: item.videoUrl,
      categoryId: item.categoryId,
      tagIds: item.tags.map((entry) => entry.tagId),
    });
    setContentFormOpen(true);
  };

  const uploadThumbnailFile = async (file: File) => {
    setThumbnailUploadLoading(true);
    setThumbnailUploadError(null);
    setThumbnailUploadSuccess(null);

    try {
      const response = await uploadImage(file);
      const uploadedUrl = response.data.url;

      setContentDraft((prev) => ({ ...prev, thumbnail: uploadedUrl }));
      setThumbnailUploadSuccess('Thumbnail uploaded successfully.');
      setThumbnailSelectedFile(file.name);
    } catch (err) {
      setThumbnailUploadError(err instanceof Error ? err.message : 'Unable to upload thumbnail.');
    } finally {
      setThumbnailUploadLoading(false);
    }
  };

  const uploadVideoFile = async (file: File) => {
    setVideoUploadLoading(true);
    setVideoUploadError(null);
    setVideoUploadSuccess(null);

    try {
      const response = await uploadVideo(file);
      const uploadedUrl = response.data.url;

      setContentDraft((prev) => ({ ...prev, videoUrl: uploadedUrl }));
      setVideoUploadSuccess('Video uploaded successfully.');
      setVideoSelectedFile(file.name);
    } catch (err) {
      setVideoUploadError(err instanceof Error ? err.message : 'Unable to upload video.');
    } finally {
      setVideoUploadLoading(false);
    }
  };

  const submitContent = async () => {
    const trimmedTitle = contentDraft.title.trim();
    const trimmedSlug = contentDraft.slug.trim();
    const trimmedDescription = contentDraft.description.trim();
    const trimmedVideoUrl = contentDraft.videoUrl.trim();
    const trimmedThumbnail = contentDraft.thumbnail.trim();

    if (!trimmedTitle) return setContentFormError('Title is required.');
    if (!trimmedSlug) return setContentFormError('Slug is required.');
    if (!trimmedDescription) return setContentFormError('Description is required.');
    if (!trimmedVideoUrl) return setContentFormError('Video URL is required.');
    if (!contentDraft.categoryId) return setContentFormError('Category is required.');
    if (!isValidUrl(trimmedVideoUrl)) return setContentFormError('Video URL must be a valid URL.');
    if (trimmedThumbnail && !isValidUrl(trimmedThumbnail)) return setContentFormError('Thumbnail must be a valid URL.');

    setContentSubmitLoading(true);
    setContentFormError(null);

    try {
      const payload = {
        title: trimmedTitle,
        slug: trimmedSlug,
        description: trimmedDescription,
        thumbnail: trimmedThumbnail || null,
        videoUrl: trimmedVideoUrl,
        categoryId: contentDraft.categoryId,
        tagIds: contentDraft.tagIds,
      };

      if (editingContentId) {
        await updateContent(editingContentId, payload);
        setContentSuccess('Content updated.');
      } else {
        await createContent(payload);
        setContentSuccess('Content created.');
      }

      setContentFormOpen(false);
      setEditingContentId(null);
      setContentDraft(emptyContentForm());
      setContentSlugTouched(false);
      await loadContents();
    } catch (err) {
      setContentFormError(err instanceof Error ? err.message : 'Unable to save content.');
    } finally {
      setContentSubmitLoading(false);
    }
  };

  const deleteContentItem = async (id: string) => {
    const target = contents.find((item) => item.id === id);
    if (!target) return;
    if (!window.confirm(`Delete "${target.title}"?`)) return;

    try {
      await deleteContent(id);
      setContentSuccess('Content deleted.');
      await loadContents();
    } catch (err) {
      setContentFormError(err instanceof Error ? err.message : 'Unable to delete content.');
    }
  };

  const openCategoryCreate = () => {
    setEditingCategoryId(null);
    setCategoryFormError(null);
    setCategorySuccess(null);
    setCategorySlugTouched(false);
    setCategoryDraft(emptyNameSlug());
  };

  const openCategoryEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryFormError(null);
    setCategorySuccess(null);
    setCategorySlugTouched(true);
    setCategoryDraft({ name: category.name, slug: category.slug });
  };

  const submitCategory = async () => {
    const trimmedName = categoryDraft.name.trim();
    const trimmedSlug = categoryDraft.slug.trim();

    if (!trimmedName) return setCategoryFormError('Category name is required.');
    if (!trimmedSlug) return setCategoryFormError('Category slug is required.');

    setCategorySubmitLoading(true);
    setCategoryFormError(null);

    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, { name: trimmedName, slug: trimmedSlug });
        setCategorySuccess('Category updated.');
      } else {
        await createCategory({ name: trimmedName, slug: trimmedSlug });
        setCategorySuccess('Category created.');
      }

      setEditingCategoryId(null);
      setCategoryDraft(emptyNameSlug());
      setCategorySlugTouched(false);
      await loadCategories();
    } catch (err) {
      setCategoryFormError(err instanceof Error ? err.message : 'Unable to save category.');
    } finally {
      setCategorySubmitLoading(false);
    }
  };

  const deleteCategoryItem = async (id: string) => {
    const target = categories.find((item) => item.id === id);
    if (!target) return;
    if (!window.confirm(`Delete category "${target.name}"?`)) return;

    try {
      await deleteCategory(id);
      setCategorySuccess('Category deleted.');
      await loadCategories();
    } catch (err) {
      setCategoryFormError(err instanceof Error ? err.message : 'Unable to delete category.');
    }
  };

  const openTagCreate = () => {
    setEditingTagId(null);
    setTagFormError(null);
    setTagSuccess(null);
    setTagSlugTouched(false);
    setTagDraft(emptyNameSlug());
  };

  const openTagEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setTagFormError(null);
    setTagSuccess(null);
    setTagSlugTouched(true);
    setTagDraft({ name: tag.name, slug: tag.slug });
  };

  const submitTag = async () => {
    const trimmedName = tagDraft.name.trim();
    const trimmedSlug = tagDraft.slug.trim();

    if (!trimmedName) return setTagFormError('Tag name is required.');
    if (!trimmedSlug) return setTagFormError('Tag slug is required.');

    setTagSubmitLoading(true);
    setTagFormError(null);

    try {
      if (editingTagId) {
        await updateTag(editingTagId, { name: trimmedName, slug: trimmedSlug });
        setTagSuccess('Tag updated.');
      } else {
        await createTag({ name: trimmedName, slug: trimmedSlug });
        setTagSuccess('Tag created.');
      }

      setEditingTagId(null);
      setTagDraft(emptyNameSlug());
      setTagSlugTouched(false);
      await loadTags();
    } catch (err) {
      setTagFormError(err instanceof Error ? err.message : 'Unable to save tag.');
    } finally {
      setTagSubmitLoading(false);
    }
  };

  const deleteTagItem = async (id: string) => {
    const target = tags.find((item) => item.id === id);
    if (!target) return;
    if (!window.confirm(`Delete tag "${target.name}"?`)) return;

    try {
      await deleteTag(id);
      setTagSuccess('Tag deleted.');
      await loadTags();
    } catch (err) {
      setTagFormError(err instanceof Error ? err.message : 'Unable to delete tag.');
    }
  };

  return (
    <AppShell>
      <Seo
        title="Admin Dashboard | LuxeVerse"
        description="Manage LuxeVerse content, categories, tags, and platform analytics."
        canonicalPath="/admin"
        robots="noindex,nofollow"
      />
      <h1 className="sr-only">Admin Dashboard</h1>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 sm:p-6">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
            {(['content', 'categories', 'tags'] as SectionKey[]).map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
                role="tab"
                aria-selected={activeSection === section}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${activeSection === section ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-950/30' : 'border border-white/10 bg-slate-900 text-slate-300 hover:border-white/25 hover:text-white'}`}
              >
                {section === 'content' ? 'Content' : section === 'categories' ? 'Categories' : 'Tags'}
              </button>
            ))}
          </div>
        </div>

        {activeSection === 'content' && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">Content</h2>
              <button type="button" onClick={openContentCreate} className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fuchsia-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">
                <Plus className="h-4 w-4" /> Create Content
              </button>
            </div>

            {contentSuccess && <p className="mb-4 text-sm text-emerald-400">{contentSuccess}</p>}
            {contentsError && <p className="mb-4 text-sm text-red-400">{contentsError}</p>}

            {contentFormOpen && (
              <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">{editingContentId ? 'Edit Content' : 'Create Content'}</h3>
                  <button type="button" aria-label="Close content form" onClick={() => setContentFormOpen(false)} className="rounded-xl border border-white/10 bg-slate-800 p-2 text-slate-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {contentFormError && <p className="mb-3 text-sm text-red-400">{contentFormError}</p>}

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm text-slate-300">
                    <span className="mb-1 block">Title</span>
                    <input
                      value={contentDraft.title}
                      onChange={(e) => {
                        const value = e.target.value;
                        setContentDraft((prev) => ({
                          ...prev,
                          title: value,
                          slug: !contentSlugTouched && !editingContentId ? toSlug(value) : prev.slug,
                        }));
                        if (!contentSlugTouched) setContentSlugTouched(false);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                    />
                  </label>

                  <label className="block text-sm text-slate-300">
                    <span className="mb-1 block">Slug</span>
                    <input
                      value={contentDraft.slug}
                      onChange={(e) => {
                        setContentSlugTouched(true);
                        setContentDraft((prev) => ({ ...prev, slug: e.target.value }));
                      }}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                    />
                  </label>

                  <label className="block text-sm text-slate-300 md:col-span-2">
                    <span className="mb-1 block">Description</span>
                    <textarea
                      value={contentDraft.description}
                      onChange={(e) => setContentDraft((prev) => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                    />
                  </label>

                  <div className="block text-sm text-slate-300">
                    <span className="mb-1 block">Thumbnail</span>
                    <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950 p-3">
                      <input
                        value={contentDraft.thumbnail}
                        onChange={(e) => setContentDraft((prev) => ({ ...prev, thumbnail: e.target.value }))}
                        placeholder="Paste thumbnail URL or upload a file"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          ref={thumbnailInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            void uploadThumbnailFile(file);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          disabled={thumbnailUploadLoading}
                          className="rounded-full bg-fuchsia-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
                        >
                          {thumbnailUploadLoading ? 'Uploading...' : 'Upload image'}
                        </button>
                      </div>
                      {thumbnailSelectedFile && <p className="text-xs text-slate-400">Selected file: {thumbnailSelectedFile}</p>}
                      {thumbnailUploadError && <p className="text-xs text-red-400">{thumbnailUploadError}</p>}
                      {thumbnailUploadSuccess && <p className="text-xs text-emerald-400">{thumbnailUploadSuccess}</p>}
                      {contentDraft.thumbnail && (
                        <img src={contentDraft.thumbnail} alt="Thumbnail preview" className="h-28 w-full rounded-lg object-cover" />
                      )}
                    </div>
                  </div>

                  <div className="block text-sm text-slate-300">
                    <span className="mb-1 block">Video</span>
                    <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950 p-3">
                      <input
                        value={contentDraft.videoUrl}
                        onChange={(e) => setContentDraft((prev) => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="Paste video URL or upload a file"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            void uploadVideoFile(file);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={videoUploadLoading}
                          className="rounded-full bg-fuchsia-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
                        >
                          {videoUploadLoading ? 'Uploading...' : 'Upload video'}
                        </button>
                      </div>
                      {videoSelectedFile && <p className="text-xs text-slate-400">Selected file: {videoSelectedFile}</p>}
                      {videoUploadError && <p className="text-xs text-red-400">{videoUploadError}</p>}
                      {videoUploadSuccess && <p className="text-xs text-emerald-400">{videoUploadSuccess}</p>}
                      {contentDraft.videoUrl && (
                        <video src={contentDraft.videoUrl} controls className="h-32 w-full rounded-lg bg-slate-950 object-cover" />
                      )}
                    </div>
                  </div>

                  <label className="block text-sm text-slate-300">
                    <span className="mb-1 block">Category</span>
                    <select
                      value={contentDraft.categoryId}
                      onChange={(e) => setContentDraft((prev) => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm text-slate-300">
                    <span className="mb-1 block">Tags</span>
                    <select
                      multiple
                      value={contentDraft.tagIds}
                      onChange={(e) => {
                        const next = Array.from(e.target.selectedOptions, (option) => option.value);
                        setContentDraft((prev) => ({ ...prev, tagIds: next }));
                      }}
                      className="h-32 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                    >
                      {tags.map((tag) => (
                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                  <button type="button" onClick={() => setContentFormOpen(false)} className="rounded-full border border-white/10 bg-slate-800 px-4 py-2 text-sm text-slate-200">Cancel</button>
                  <button type="button" onClick={() => void submitContent()} disabled={contentSubmitLoading} className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                    {contentSubmitLoading ? 'Saving...' : editingContentId ? 'Update Content' : 'Create Content'}
                  </button>
                </div>
              </div>
            )}

            {loadingContents ? (
              <p className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-400">Loading content…</p>
            ) : contents.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-400">No content found. Create the first release to populate the library.</p>
            ) : (
              <div className="space-y-4">
                {contents.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">/{item.slug}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                          <span className="rounded-full border border-white/10 bg-slate-950 px-2 py-1">{item.category?.name || item.categoryId}</span>
                          {item.tags.map(({ tag }) => (
                            <span key={tag.id} className="rounded-full border border-white/10 bg-slate-950 px-2 py-1">#{tag.name}</span>
                          ))}
                        </div>
                        <p className="mt-3 text-sm text-slate-300">{item.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openContentEdit(item)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => void deleteContentItem(item.id)} className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-[11px] text-slate-400">
                      Created {new Date(item.createdAt).toLocaleString()} · Updated {new Date(item.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'categories' && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">Categories</h2>
              <button type="button" onClick={openCategoryCreate} className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fuchsia-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">
                <Plus className="h-4 w-4" /> Create Category
              </button>
            </div>

            {categorySuccess && <p className="mb-4 text-sm text-emerald-400">{categorySuccess}</p>}
            {categoriesError && <p className="mb-4 text-sm text-red-400">{categoriesError}</p>}

            <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  <span className="mb-1 block">Name</span>
                  <input
                    value={categoryDraft.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCategoryDraft((prev) => ({
                        ...prev,
                        name: value,
                        slug: !categorySlugTouched ? toSlug(value) : prev.slug,
                      }));
                    }}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  <span className="mb-1 block">Slug</span>
                  <input
                    value={categoryDraft.slug}
                    onChange={(e) => {
                      setCategorySlugTouched(true);
                      setCategoryDraft((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                  />
                </label>
              </div>

              {categoryFormError && <p className="mt-3 text-sm text-red-400">{categoryFormError}</p>}

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setCategoryDraft(emptyNameSlug()); setCategorySlugTouched(false); setCategoryFormError(null); setEditingCategoryId(null); }} className="rounded-full border border-white/10 bg-slate-800 px-4 py-2 text-sm text-slate-200">Reset</button>
                <button type="button" onClick={() => void submitCategory()} disabled={categorySubmitLoading} className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  {categorySubmitLoading ? 'Saving...' : editingCategoryId ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </div>

            {loadingCategories ? (
              <p className="text-slate-400">Loading categories…</p>
            ) : categories.length === 0 ? (
              <p className="text-slate-400">No categories found.</p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-white">{category.name}</p>
                      <p className="text-sm text-slate-400">/{category.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openCategoryEdit(category)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => void deleteCategoryItem(category.id)} className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'tags' && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">Tags</h2>
              <button type="button" onClick={openTagCreate} className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fuchsia-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">
                <Plus className="h-4 w-4" /> Create Tag
              </button>
            </div>

            {tagSuccess && <p className="mb-4 text-sm text-emerald-400">{tagSuccess}</p>}
            {tagsError && <p className="mb-4 text-sm text-red-400">{tagsError}</p>}

            <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  <span className="mb-1 block">Name</span>
                  <input
                    value={tagDraft.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTagDraft((prev) => ({
                        ...prev,
                        name: value,
                        slug: !tagSlugTouched ? toSlug(value) : prev.slug,
                      }));
                    }}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  <span className="mb-1 block">Slug</span>
                  <input
                    value={tagDraft.slug}
                    onChange={(e) => {
                      setTagSlugTouched(true);
                      setTagDraft((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-500"
                  />
                </label>
              </div>

              {tagFormError && <p className="mt-3 text-sm text-red-400">{tagFormError}</p>}

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setTagDraft(emptyNameSlug()); setTagSlugTouched(false); setTagFormError(null); setEditingTagId(null); }} className="rounded-full border border-white/10 bg-slate-800 px-4 py-2 text-sm text-slate-200">Reset</button>
                <button type="button" onClick={() => void submitTag()} disabled={tagSubmitLoading} className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  {tagSubmitLoading ? 'Saving...' : editingTagId ? 'Update Tag' : 'Create Tag'}
                </button>
              </div>
            </div>

            {loadingTags ? (
              <p className="text-slate-400">Loading tags…</p>
            ) : tags.length === 0 ? (
              <p className="text-slate-400">No tags found.</p>
            ) : (
              <div className="space-y-3">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-white">{tag.name}</p>
                      <p className="text-sm text-slate-400">/{tag.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openTagEdit(tag)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => void deleteTagItem(tag.id)} className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Go to LuxeVerse home" className="flex items-center gap-3 text-xl font-bold tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-400/30"><Film className="h-5 w-5" /></span>Luxe<span className="text-fuchsia-300">Verse</span><span className="ml-1 hidden border-l border-white/10 pl-3 text-sm font-medium text-slate-400 sm:inline">Admin</span></Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

export default AdminDashboard;
