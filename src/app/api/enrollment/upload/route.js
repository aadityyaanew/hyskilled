import { NextResponse } from "next/server";
import { uploadImageToR2, uploadPdfToR2 } from "@/lib/r2";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg", "image/jpg", "image/png", "image/webp",
];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ...ALLOWED_IMAGE_TYPES,
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const type = (formData.get("type") || "doc").toString(); // "photo" | "id" | "resume" | "receipt"

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size is 10MB.` },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isPdf = mimeType === "application/pdf";
    const isDoc = ALLOWED_DOC_TYPES.includes(mimeType);

    if (!isDoc) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, WebP, PDF, DOC, DOCX." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let result;

    if (type === "resume" && (isPdf || mimeType.includes("word"))) {
      // Use PDF uploader for resumes
      result = await uploadPdfToR2({
        buffer,
        filename: file.name || "resume.pdf",
        courseSlug: null,
      });
      result = { fileUrl: result.fileUrl };
    } else if (isImage) {
      result = await uploadImageToR2({
        buffer,
        filename: file.name || "file.jpg",
        mimetype: mimeType,
        folder: `enrollment/${type}`,
      });
      result = { fileUrl: result.fileUrl };
    } else {
      // PDF for IDs and receipts
      result = await uploadPdfToR2({
        buffer,
        filename: file.name || `${type}.pdf`,
        courseSlug: null,
      });
      result = { fileUrl: result.fileUrl };
    }

    return NextResponse.json({ success: true, url: result.fileUrl });
  } catch (error) {
    console.error("Enrollment file upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}
