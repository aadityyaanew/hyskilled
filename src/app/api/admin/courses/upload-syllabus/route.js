import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { uploadPdfToGoogleDrive } from "@/lib/google-drive";

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(req) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ success: false, message: "Invalid form data submission." }, { status: 400 });
    }

    const file = formData.get("file");
    const courseSlug = formData.get("courseSlug") || "";

    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, message: "No syllabus PDF file provided." }, { status: 400 });
    }

    // 1. File size validation
    if (file.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: `File size exceeds the 25MB limit (provided: ${(file.size / (1024 * 1024)).toFixed(1)}MB).` },
        { status: 400 }
      );
    }

    // 2. MIME type & extension validation
    const filename = file.name || "syllabus.pdf";
    const isPdfExt = /\.pdf$/i.test(filename);
    const isPdfMime = file.type === "application/pdf" || file.type === "application/x-pdf";

    if (!isPdfExt && !isPdfMime) {
      return NextResponse.json(
        { success: false, message: "Only PDF documents are allowed for the course syllabus." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Magic number verification for PDF (%PDF-)
    if (buffer.length < 5 || buffer.toString("utf8", 0, 5) !== "%PDF-") {
      return NextResponse.json(
        { success: false, message: "The uploaded file is not a valid PDF document." },
        { status: 400 }
      );
    }

    // 4. Secure upload to Google Drive
    const result = await uploadPdfToGoogleDrive({
      buffer,
      filename,
      courseSlug: String(courseSlug),
    });

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      fileUrl: result.webViewLink,
      downloadUrl: result.webContentLink,
      filename: result.filename,
    });
  } catch (error) {
    console.error("Syllabus upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to upload syllabus to Google Drive.",
      },
      { status: 500 }
    );
  }
}
