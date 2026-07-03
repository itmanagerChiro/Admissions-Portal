import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

export interface StorageProvider {
  upload(
    file: Buffer,
    originalFilename: string,
    mimeType: string
  ): Promise<{ key: string; storedFilename: string }>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "uploads");
  }

  async upload(
    file: Buffer,
    originalFilename: string,
    mimeType: string
  ): Promise<{ key: string; storedFilename: string }> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const ext = path.extname(originalFilename);
    const storedFilename = `${randomUUID()}${ext}`;
    const key = storedFilename;
    await fs.writeFile(path.join(this.uploadDir, storedFilename), file);
    return { key, storedFilename };
  }

  async getUrl(key: string): Promise<string> {
    return `/api/files/${key}`;
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.uploadDir, key));
    } catch {
      // File may not exist
    }
  }
}

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  if (provider === "local") {
    return new LocalStorageProvider();
  }
  throw new Error(`Unsupported storage provider: ${provider}`);
}
