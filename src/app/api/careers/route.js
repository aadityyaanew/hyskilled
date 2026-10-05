import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { getS3Client } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const fullName = formData.get("fullName");
    const phoneNo = formData.get("phoneNo");
    const email = formData.get("email");
    const role = formData.get("role");
    const experience = formData.get("experience");
    const resume = formData.get("resume");

    if (!fullName || !phoneNo || !email || !role || !experience || !resume) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await resume.arrayBuffer());
    const originalFilename = resume.name;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;
    const s3Client = getS3Client();

    const safeFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
    const uniqueId = Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7);
    const fileKey = `resumes/${uniqueId}-${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: resume.type || "application/octet-stream",
      ContentDisposition: `inline; filename="${safeFilename}"`,
    });

    await s3Client.send(command);

    const resumeUrl = `${publicUrl.replace(/\/$/, "")}/${fileKey}`;

    await execute(
      `INSERT INTO job_applications (full_name, phone_no, email, role, experience, resume_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, phoneNo, email, role, experience, resumeUrl]
    );

    return NextResponse.json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error submitting job application:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
