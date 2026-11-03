/**
 * Lighter copies of Cloudinary pictures for students.
 *
 * Pictures are stored as full-size PNGs, some over 2 MB. Cloudinary serves a
 * copy in a modern format (WebP or AVIF, picked per browser) and shrinks
 * anything bigger than the limits below. c_limit only ever scales down: it
 * keeps the picture's shape and never crops, stretches or enlarges.
 *
 * - page: pictures inside a question, option or explanation. They are shown at
 *   most 288 CSS px tall, so 1000 px tall still fills a 3x phone screen, and
 *   1400 px wide still fills the widest picture on a 2x laptop screen.
 * - zoom: the full-screen lightbox. Full size, best quality setting.
 *
 * The step goes last in the link, after any watermark step, so the watermark
 * shrinks with the picture. Links from other hosts, GIFs and SVGs come back
 * unchanged.
 */
const SIZES = {
  page: "f_auto,q_auto,c_limit,w_1400,h_1000",
  zoom: "f_auto,q_auto:best,c_limit,w_2400,h_2400",
} as const;

export type ImageSize = keyof typeof SIZES;

// Everything before the version part (host + any steps), then the version part onwards.
const CLOUDINARY_IMAGE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:[^/]+\/)*?)(v\d+\/.+)$/;

export function displayImageUrl(url: string, size: ImageSize = "page"): string {
  const match = CLOUDINARY_IMAGE.exec(url);
  if (!match) return url;
  const [, head, tail] = match;
  if (/\.(gif|svg)(\?|$)/i.test(tail)) return url;
  if (/[/,]f_auto[,/]/.test(head)) return url;
  return `${head}${SIZES[size]}/${tail}`;
}
