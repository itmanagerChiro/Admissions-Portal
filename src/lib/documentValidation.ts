import type { RequiredDocumentCategory } from "@/generated/prisma/client";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const CATEGORY_ACCEPT: Record<RequiredDocumentCategory, string> = {
  ANY: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp",
  DOCUMENT: ".pdf,.doc,.docx",
  IMAGE: ".jpg,.jpeg,.png,.webp,.heic,.heif",
};

export const CATEGORY_LABELS: Record<RequiredDocumentCategory, string> = {
  ANY: "Any file type",
  DOCUMENT: "Document (PDF or Word) — e.g. transcripts",
  IMAGE: "Image only — e.g. passport or ID photo",
};

export function isMimeTypeAllowed(mimeType: string, category: RequiredDocumentCategory): boolean {
  if (category === "ANY") return true;
  if (category === "DOCUMENT") return DOCUMENT_MIME_TYPES.includes(mimeType);
  if (category === "IMAGE") return IMAGE_MIME_TYPES.includes(mimeType);
  return false;
}

export function categoryRejectionMessage(category: RequiredDocumentCategory): string {
  if (category === "DOCUMENT") return "This task requires a document file (PDF or Word).";
  if (category === "IMAGE") return "This task requires an image file (JPG, PNG or WEBP).";
  return "File type not allowed.";
}
