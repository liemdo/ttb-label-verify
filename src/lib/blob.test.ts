import { describe, expect, it } from "vitest";
import {
  isVercelBlobUrl,
  labelImageSrc,
  sanitizeBlobFileName,
} from "@/lib/blob";

describe("isVercelBlobUrl", () => {
  it("accepts private blob hosts only", () => {
    expect(
      isVercelBlobUrl(
        "https://abc.private.blob.vercel-storage.com/labels/one.jpg"
      )
    ).toBe(true);
    expect(isVercelBlobUrl("https://example.com/one.jpg")).toBe(false);
    expect(isVercelBlobUrl("data:image/png;base64,xx")).toBe(false);
  });
});

describe("labelImageSrc", () => {
  it("proxies blob URLs and leaves data URLs alone", () => {
    const blob =
      "https://abc.private.blob.vercel-storage.com/labels/one.jpg";
    expect(labelImageSrc(blob)).toBe(
      `/api/label-image?url=${encodeURIComponent(blob)}`
    );
    expect(labelImageSrc("data:image/png;base64,xx")).toBe(
      "data:image/png;base64,xx"
    );
    expect(labelImageSrc("/uploads/local.jpg")).toBe("/uploads/local.jpg");
  });
});

describe("sanitizeBlobFileName", () => {
  it("replaces unsafe characters and falls back when empty", () => {
    expect(sanitizeBlobFileName("Hochstadter's Rye.jpeg")).toBe(
      "Hochstadter_s_Rye.jpeg"
    );
    expect(sanitizeBlobFileName("   ")).toBe("label.jpg");
  });
});
