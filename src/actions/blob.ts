"use server";

import { putLabelImage } from "@/lib/blob-storage";

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return !!value && typeof value !== "string" && "arrayBuffer" in value;
}

export async function uploadLabelImageAction(formData: FormData): Promise<string> {
  const file = formData.get("file");
  if (!isUploadedFile(file)) {
    throw new Error("No image file provided");
  }

  return putLabelImage(file);
}
