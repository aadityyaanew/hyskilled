import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export function getS3Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing Cloudflare R2 credentials in .env.local");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Uploads a syllabus PDF file buffer securely to Cloudflare R2.
 *
 * @param {Object} options
 * @param {Buffer} options.buffer - PDF file binary buffer
 * @param {string} options.filename - Original filename
 * @param {string} [options.courseSlug] - Course slug or title for tagging
 * @returns {Promise<{ fileId: string, fileUrl: string, downloadUrl: string, filename: string }>}
 */
export async function uploadPdfToR2({ buffer, filename, courseSlug }) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty PDF buffer provided.");
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL; // e.g. https://pub-xxxxxxxxxxxxx.r2.dev

  if (!bucketName || !publicUrl) {
    throw new Error("Missing R2_BUCKET_NAME or R2_PUBLIC_URL in .env.local");
  }

  const s3Client = getS3Client();

  const safeFilename = filename.endsWith(".pdf")
    ? filename
    : `${filename.replace(/\.[^/.]+$/, "")}.pdf`;

  // Generate a unique file key
  const uniqueId = Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7);
  const fileKey = courseSlug 
    ? `syllabuses/${courseSlug}-${uniqueId}.pdf` 
    : `syllabuses/${safeFilename.replace(/[^a-z0-9.-]/gi, "-").toLowerCase()}-${uniqueId}.pdf`;

  const displayName = courseSlug
    ? `Hyskilled - Syllabus - ${courseSlug}.pdf`
    : `Hyskilled - Syllabus - ${safeFilename}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: "application/pdf",
    ContentDisposition: `inline; filename="${displayName}"`,
    // If you want to force download:
    // ContentDisposition: `attachment; filename="${displayName}"`,
  });

  try {
    await s3Client.send(command);
  } catch (err) {
    console.error("Cloudflare R2 API upload failed:", err);
    throw new Error(
      err.message || "Failed to upload file to Cloudflare R2."
    );
  }

  // Construct the public URL for the file
  const fileUrl = `${publicUrl.replace(/\/$/, "")}/${fileKey}`;

  return {
    fileId: fileKey,
    fileUrl: fileUrl,
    downloadUrl: fileUrl,
    filename: displayName,
  };
}

/**
 * Deletes a file from Cloudflare R2.
 */
export async function deleteFileFromR2(fileKey) {
  if (!fileKey) return;

  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) return;

  const s3Client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  try {
    await s3Client.send(command);
  } catch (err) {
    console.warn(`Could not delete R2 file ${fileKey}:`, err.message);
  }
}

/**
 * Uploads an image file buffer securely to Cloudflare R2.
 *
 * @param {Object} options
 * @param {Buffer} options.buffer - Image file binary buffer
 * @param {string} options.filename - Original filename
 * @param {string} options.mimetype - Image mimetype
 * @param {string} [options.folder] - Folder path to store image
 * @returns {Promise<{ fileUrl: string, fileKey: string }>}
 */
export async function uploadImageToR2({ buffer, filename, mimetype, folder = "images" }) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty image buffer provided.");
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!bucketName || !publicUrl) {
    throw new Error("Missing R2_BUCKET_NAME or R2_PUBLIC_URL in .env.local");
  }

  const s3Client = getS3Client();

  const safeFilename = filename.replace(/[^a-z0-9.-]/gi, "-").toLowerCase();
  
  // Generate a unique file key
  const uniqueId = Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7);
  const fileKey = `${folder.replace(/\/$/, "")}/${uniqueId}-${safeFilename}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: mimetype,
    ContentDisposition: "inline",
  });

  try {
    await s3Client.send(command);
  } catch (err) {
    console.error("Cloudflare R2 API upload failed:", err);
    throw new Error(
      err.message || "Failed to upload image to Cloudflare R2."
    );
  }

  const fileUrl = `${publicUrl.replace(/\/$/, "")}/${fileKey}`;

  return {
    fileUrl,
    fileKey,
  };
}
