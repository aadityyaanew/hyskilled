import { getSetting, setSetting } from "@/services/settings.service";

/**
 * Google Drive API v3 Service
 * Handles OAuth2 authorization, token refresh, and multipart PDF uploads to Google Drive.
 */

export function getGoogleDriveClientId() {
  return process.env.GOOGLE_CLIENT_ID || "";
}

export function getGoogleDriveClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}

export function getGoogleDriveApiKey() {
  return process.env.DRIVE_API || process.env.GOOGLE_API_KEY || "";
}

/**
 * Returns whether Google Drive API credentials (Client ID & Secret or API Key) are present in environment.
 */
export function isGoogleDriveConfigured() {
  return Boolean((getGoogleDriveClientId() && getGoogleDriveClientSecret()) || getGoogleDriveApiKey());
}

/**
 * Retrieves the Google Drive OAuth2 refresh token from environment or database settings.
 */
export async function getGoogleDriveRefreshToken() {
  if (process.env.GOOGLE_DRIVE_REFRESH_TOKEN) {
    return process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  }
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    return process.env.GOOGLE_REFRESH_TOKEN;
  }
  const tokenFromDb = await getSetting("google_drive_refresh_token", null);
  if (tokenFromDb) {
    return typeof tokenFromDb === "string" ? tokenFromDb : tokenFromDb.refresh_token || null;
  }
  return null;
}

/**
 * Generates the Google OAuth2 authorization URL for Google Drive file scope.
 */
export function getGoogleDriveAuthUrl(redirectUri, state = "") {
  const clientId = getGoogleDriveClientId();
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured in .env.local");
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  // Scope allows uploading and managing files created by this app
  url.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly"
  );
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  if (state) {
    url.searchParams.set("state", state);
  }

  return url.toString();
}

/**
 * Exchanges the Google OAuth authorization code for tokens and saves the refresh token in database settings.
 */
export async function exchangeGoogleDriveCode(code, redirectUri) {
  const clientId = getGoogleDriveClientId();
  const clientSecret = getGoogleDriveClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error("Google Client ID or Client Secret missing in .env.local");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.refresh_token) {
    throw new Error(data.error_description || data.error || "Failed to exchange authorization code for refresh token.");
  }

  // 1. Save refresh token to database settings
  await setSetting("google_drive_refresh_token", data.refresh_token);

  // 2. Persist directly to .env.local file so process.env has it permanently
  try {
    const fs = await import("fs");
    const path = await import("path");
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, "utf-8");
      if (content.includes("GOOGLE_DRIVE_REFRESH_TOKEN=")) {
        content = content.replace(
          /GOOGLE_DRIVE_REFRESH_TOKEN=.*/,
          `GOOGLE_DRIVE_REFRESH_TOKEN=${data.refresh_token}`
        );
      } else {
        content = `${content.trim()}\nGOOGLE_DRIVE_REFRESH_TOKEN=${data.refresh_token}\n`;
      }
      fs.writeFileSync(envPath, content, "utf-8");
      process.env.GOOGLE_DRIVE_REFRESH_TOKEN = data.refresh_token;
    }
  } catch (fsErr) {
    console.warn("Could not write GOOGLE_DRIVE_REFRESH_TOKEN to .env.local:", fsErr.message);
  }

  return data;
}

/**
 * Retrieves a valid OAuth2 access token for Google Drive API.
 */
export async function getGoogleDriveAccessToken() {
  const clientId = getGoogleDriveClientId();
  const clientSecret = getGoogleDriveClientSecret();
  const refreshToken = await getGoogleDriveRefreshToken();

  if (!clientId || !clientSecret) {
    throw new Error("Google Client ID or Secret is not configured in .env.local.");
  }

  if (!refreshToken) {
    throw new Error(
      "Google Drive is not connected yet. Please authorize Google Drive via the Admin Panel or set GOOGLE_DRIVE_REFRESH_TOKEN in .env.local."
    );
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || "Failed to refresh Google Drive access token. Please re-connect Google Drive."
    );
  }

  return data.access_token;
}

/**
 * Uploads a syllabus PDF file buffer securely to Google Drive via Drive v3 REST API.
 * Makes the file accessible for viewing and returns its Drive File ID and view URL.
 *
 * @param {Object} options
 * @param {Buffer} options.buffer - PDF file binary buffer
 * @param {string} options.filename - Original filename
 * @param {string} [options.courseSlug] - Course slug or title for tagging
 * @returns {Promise<{ fileId: string, webViewLink: string, webContentLink: string, filename: string }>}
 */
export async function uploadPdfToGoogleDrive({ buffer, filename, courseSlug }) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty PDF buffer provided.");
  }

  const accessToken = await getGoogleDriveAccessToken();

  const safeFilename = filename.endsWith(".pdf")
    ? filename
    : `${filename.replace(/\.[^/.]+$/, "")}.pdf`;

  const displayName = courseSlug
    ? `Hyskilled - Syllabus - ${courseSlug}.pdf`
    : `Hyskilled - Syllabus - ${safeFilename}`;

  const metadata = {
    name: displayName,
    mimeType: "application/pdf",
    description: `Course syllabus uploaded via Hyskilled Admin for ${courseSlug || "course"}`,
  };

  if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
    metadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
  }

  const boundary = "-------HyskilledGoogleDriveMultipartUpload" + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataHeader =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/pdf\r\n\r\n";

  const multipartRequestBody = Buffer.concat([
    Buffer.from(metadataHeader, "utf-8"),
    buffer,
    Buffer.from(closeDelimiter, "utf-8"),
  ]);

  // 1. Upload to Google Drive
  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": String(multipartRequestBody.length),
      },
      body: multipartRequestBody,
    }
  );

  const fileData = await uploadRes.json();
  if (!uploadRes.ok || !fileData.id) {
    console.error("Google Drive API upload failed:", fileData);
    throw new Error(
      fileData.error?.message || "Failed to upload file to Google Drive. Check permissions and storage quota."
    );
  }

  const fileId = fileData.id;

  // 2. Grant public read permission ("anyone with link can view") so syllabus can be retrieved and downloaded
  try {
    const permRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "reader",
          type: "anyone",
        }),
      }
    );
    if (!permRes.ok) {
      console.warn("Could not set public permission on Drive file:", await permRes.text());
    }
  } catch (permErr) {
    console.warn("Error setting permissions on Drive file:", permErr.message);
  }

  const webViewLink =
    fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  const webContentLink =
    fileData.webContentLink || `https://drive.google.com/uc?id=${fileId}&export=download`;

  return {
    fileId,
    webViewLink,
    webContentLink,
    filename: displayName,
  };
}

/**
 * Deletes a file from Google Drive (e.g. when replacing a syllabus).
 */
export async function deleteFileFromGoogleDrive(fileId) {
  if (!fileId) return;
  try {
    const accessToken = await getGoogleDriveAccessToken();
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (err) {
    console.warn(`Could not delete Drive file ${fileId}:`, err.message);
  }
}

/**
 * Retrieves metadata for a Google Drive file using DRIVE_API or access token.
 */
export async function getDriveFileMetadata(fileId) {
  if (!fileId) return null;
  const apiKey = getGoogleDriveApiKey();
  const accessToken = await getGoogleDriveAccessToken().catch(() => null);

  const url = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}`);
  url.searchParams.set("fields", "id,name,mimeType,webViewLink,webContentLink,size");
  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }

  const headers = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch Drive file metadata (${res.status}): ${res.statusText}`);
  }
  return res.json();
}

