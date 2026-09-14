import { del, put } from "@vercel/blob";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { isVercelBlobUrl, sanitizeBlobFileName } from "@/lib/blob";

const ALLOWED_TYPES = new Set(Object.keys(ACCEPTED_IMAGE_TYPES));

export async function putLabelImage(file: File): Promise<string> {
  const typeOk =
    ALLOWED_TYPES.has(file.type) ||
    /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!typeOk) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image exceeds the maximum upload size");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Blob storage is not configured");
  }

  const blob = await put(`labels/${sanitizeBlobFileName(file.name)}`, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type || undefined,
  });

  return blob.url;
}

export async function deleteStoredLabelImage(url: string | null | undefined): Promise<void> {
  if (!url || !isVercelBlobUrl(url)) return;
  try {
    await del(url);
  } catch (error) {
    console.error("Failed to delete label image from blob storage:", error);
  }
}

export async function deleteStoredLabelImages(urls: string[]): Promise<void> {
  const blobUrls = urls.filter(isVercelBlobUrl);
  if (blobUrls.length === 0) return;
  try {
    await del(blobUrls);
  } catch (error) {
    console.error("Failed to delete label images from blob storage:", error);
  }
}
