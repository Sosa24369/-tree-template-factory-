/**
 * R5 — every template must render correctly with MISSING data. No logo, no photos,
 * an empty copy field: it degrades, it never crashes, and it never prints "undefined".
 *
 * These primitives are the enforcement mechanism. Templates use them instead of
 * raw {value} interpolation and raw <img>.
 */

import type { CSSProperties, ElementType, ReactNode } from 'react';
import type { PhotoSet } from '../schema/client';

/**
 * Renders text only if there is text. An empty or whitespace-only value renders
 * nothing at all — not an empty heading with margins, not "undefined".
 */
export function SafeText({
  value,
  as: Tag = 'span',
  className,
  fallback = null,
}: {
  value: string | null | undefined;
  as?: ElementType;
  className?: string;
  fallback?: ReactNode;
}) {
  const text = typeof value === 'string' ? value : '';
  if (!text.trim()) return <>{fallback}</>;
  return <Tag className={className}>{text}</Tag>;
}

/**
 * Renders an image only if there is a src. Missing width/height are omitted rather
 * than guessed — P0 found 33 fabricated dimension pairs and we do not reintroduce them.
 */
export function SafeImage({
  photo,
  className,
  loading = 'lazy',
  fetchPriority,
  style,
  sizes = '(max-width: 767px) 45vw, 22vw',
}: {
  photo: PhotoSet | null | undefined;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  style?: CSSProperties;
  /** Tell the browser how wide this renders, or it will download the largest candidate. */
  sizes?: string;
}) {
  if (!photo?.src) return null;
  return (
    <img
      src={photo.src}
      {...(photo.srcset ? { srcSet: photo.srcset, sizes } : {})}
      alt={photo.alt ?? ''}
      className={className}
      style={style}
      loading={loading}
      fetchPriority={fetchPriority}
      {...(photo.width != null ? { width: photo.width } : {})}
      {...(photo.height != null ? { height: photo.height } : {})}
    />
  );
}

/**
 * Logo with a real fallback: if a client has no logo file, show their name as
 * text rather than a broken image icon.
 *
 * The header now renders the logo large (owner call), which makes it the mobile LCP on
 * text-hero templates. When the caller passes the generated srcset + intrinsic
 * width/height, the logo becomes a responsive image whose box is reserved before load
 * (CLS 0) and — with `priority` — is fetched eagerly at high priority. Passing none of
 * the optional props preserves the original plain-img behaviour, so footers are
 * unaffected.
 */
export function SafeLogo({
  logoUrl,
  clientName,
  className,
  srcset,
  sizes,
  width,
  height,
}: {
  logoUrl: string | null | undefined;
  clientName: string;
  className?: string;
  srcset?: string;
  sizes?: string;
  width?: number;
  height?: number;
  /** Accepted for call-site clarity but consumed by the prerender, which owns the
   *  single in-sync logo preload; setting it here would trip React's SSR float. */
  priority?: boolean;
}) {
  if (!logoUrl) {
    return <span className={className} data-fallback="logo-text">{clientName || ''}</span>;
  }
  return (
    <img
      src={logoUrl}
      alt={clientName ? `${clientName} logo` : ''}
      className={className}
      {...(srcset ? { srcSet: srcset, sizes } : {})}
      {...(width != null ? { width } : {})}
      {...(height != null ? { height } : {})}
      // NO loading/fetchPriority hints on the element. Under renderToString those make
      // React's float runtime hoist extra <link rel=preload> tags — a malformed
      // camelCase one AND a plain-href one for the fallback src — and the plain-href
      // pulls the 256px base while the srcset <img> uses a 128px variant, a wasted
      // double-download on the LCP path. The img is eager anyway (eager is the default
      // for a non-lazy image), and the ONE correct, in-sync preload is emitted by the
      // prerender for the templates whose LCP is the logo. `priority` is consumed there.
    />
  );
}

/**
 * Renders a section only when it has something to show. Prevents empty bordered
 * boxes and orphan headings when a client record has no reviews, no photos, etc.
 */
export function SafeSection({
  when,
  children,
}: {
  when: unknown;
  children: ReactNode;
}) {
  const has = Array.isArray(when) ? when.length > 0 : Boolean(when);
  if (!has) return null;
  return <>{children}</>;
}
