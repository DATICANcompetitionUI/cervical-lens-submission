import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";

/**
 * Uploads a file buffer to the configured storage backend (local or Supabase).
 * Returns the public URL or file path.
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = "image/jpeg"
): Promise<{ filePath: string; publicUrl: string }> {
  const backend = config.storage.backend;

  if (backend === "supabase" && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = config.storage.s3Bucket || "cervicallens-slides";
    
    // Upload via Supabase Storage REST API
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`;
    
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": contentType,
        // x-upsert to overwrite if exists
        "x-upsert": "true",
      },
      body: fileBuffer,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Supabase storage upload failed:", errText);
      throw new Error(`Supabase upload failed: ${res.statusText}`);
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
    return {
      filePath: `${bucket}/${fileName}`,
      publicUrl,
    };
  }

  // Fallback to local file system
  const localDir = path.resolve(config.storage.localPath);
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  const filePath = path.join(localDir, fileName);
  fs.writeFileSync(filePath, fileBuffer);

  // For local development, we return a local URL or relative path
  const publicUrl = `${config.auth.url}/storage/slides/${fileName}`;
  return {
    filePath: `storage/slides/${fileName}`,
    publicUrl,
  };
}

/**
 * Downloads a file buffer from the configured storage backend.
 */
export async function downloadFile(filePath: string): Promise<Buffer> {
  const backend = config.storage.backend;

  if (backend === "supabase" && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // filePath contains "bucket/filename"
    const downloadUrl = `${supabaseUrl}/storage/v1/object/${filePath}`;
    
    const res = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to download file from Supabase: ${res.statusText}`);
    }

    return Buffer.from(await res.arrayBuffer());
  }

  // Local filesystem download
  // filePath is "storage/slides/filename" or similar
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    // try relative to project root
    const rootPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(rootPath)) {
      return fs.readFileSync(rootPath);
    }
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(fullPath);
}
