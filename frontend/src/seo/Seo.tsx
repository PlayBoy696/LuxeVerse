import { Helmet } from 'react-helmet-async';

export const DEFAULT_DESCRIPTION = 'Discover and watch videos, films, documentaries and digital content on LuxeVerse.';

const siteUrl = (import.meta.env.VITE_SITE_URL?.trim() ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')).replace(/\/+$/, '');

export function getSiteUrl(path = '/') {
  return `${siteUrl}/${path.replace(/^\/+/, '')}`;
}

export function trimDescription(value: string | null | undefined, maxLength = 160) {
  const description = value?.replace(/\s+/g, ' ').trim();
  if (!description) {
    return DEFAULT_DESCRIPTION;
  }

  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength - 3).trimEnd()}...`;
}

type SeoProps = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string | null;
  type?: 'website' | 'video.other';
  robots?: string;
  structuredData?: Record<string, unknown> | null;
};

export default function Seo({
  title = 'LuxeVerse | Discover Videos & Films',
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  image,
  type = 'website',
  robots = 'index,follow',
  structuredData,
}: SeoProps) {
  const canonicalUrl = getSiteUrl(canonicalPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const metaDescription = trimDescription(description);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={robots} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="LuxeVerse" />
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta name="twitter:image" content={image} />}
      <link rel="canonical" href={canonicalUrl} />
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
