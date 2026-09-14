/** Vercel Blob URLs look like `https://<store>.private.blob.vercel-storage.com/...` */
export function isVercelBlobUrl(url: string): boolean {
  if (!url.startsWith("https://")) return false;
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Private blob URLs must be fetched through our delivery route. Legacy `data:` URLs pass through. */
export function labelImageSrc(url: string): string {
  if (!url || url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/")) {
    return url;
  }
  if (isVercelBlobUrl(url)) {
    return `/api/label-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function sanitizeBlobFileName(name: string): string {
  const trimmed = name.trim().replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return trimmed || "label.jpg";
}
