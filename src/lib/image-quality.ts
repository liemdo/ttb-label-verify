import type { ImageQualityReport } from "@/types";

const MIN_RESOLUTION = 500;

/**
 * Assess image quality before sending to OCR.
 * Runs client-side by loading the image into a canvas.
 */
export function checkImageQuality(file: File): Promise<ImageQualityReport> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const warnings: string[] = [];
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const fileSizeMB = file.size / (1024 * 1024);
      const isLowResolution = width < MIN_RESOLUTION || height < MIN_RESOLUTION;

      if (isLowResolution) {
        warnings.push(
          `Low resolution (${width}×${height}px). Minimum recommended: ${MIN_RESOLUTION}×${MIN_RESOLUTION}px.`
        );
      }

      if (fileSizeMB > 10) {
        warnings.push(
          `Large file size (${fileSizeMB.toFixed(1)} MB). Processing may be slower.`
        );
      }

      if (fileSizeMB < 0.01) {
        warnings.push(
          "Very small file size. Image may be too compressed for accurate OCR."
        );
      }

      URL.revokeObjectURL(url);
      resolve({ width, height, isLowResolution, fileSizeMB, warnings });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: 0,
        height: 0,
        isLowResolution: true,
        fileSizeMB: file.size / (1024 * 1024),
        warnings: ["Could not load image for quality assessment."],
      });
    };

    img.src = url;
  });
}
