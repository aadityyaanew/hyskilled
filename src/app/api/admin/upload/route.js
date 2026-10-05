import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getCurrentAdmin } from "@/lib/auth-server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Allowed image formats
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed formats: PNG, JPG, JPEG, WebP, GIF, SVG." },
        { status: 400 }
      );
    }

    // 10 MB limit
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `Image size exceeds the 10MB limit (provided: ${(file.size / (1024 * 1024)).toFixed(1)}MB).` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    const folder = (formData.get("folder") || "hyskilled_courses").toString();

    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: "auto",
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
