import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Minio.Client;
  private readonly bucketDocuments: string;
  private readonly bucketMedia: string;

  constructor(private config: ConfigService) {
    this.client = new Minio.Client({
      endPoint: config.get('MINIO_ENDPOINT', 'localhost'),
      port: config.get<number>('MINIO_PORT', 9000),
      useSSL: config.get('MINIO_USE_SSL') === 'true',
      accessKey: config.get('MINIO_ACCESS_KEY', ''),
      secretKey: config.get('MINIO_SECRET_KEY', ''),
    });
    this.bucketDocuments = config.get('MINIO_BUCKET_DOCUMENTS', 'xamle-documents');
    this.bucketMedia = config.get('MINIO_BUCKET_MEDIA', 'xamle-media');
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{ key: string; url: string; bucket: string }> {
    const isImage = mimeType.startsWith('image/');
    const bucket = isImage ? this.bucketMedia : this.bucketDocuments;
    const ext = path.extname(originalName);
    const key = `${uuidv4()}${ext}`;

    await this.client.putObject(bucket, key, buffer, buffer.length, {
      'Content-Type': mimeType,
      'x-amz-meta-original-name': originalName,
    });

    const endpoint = this.config.get('MINIO_ENDPOINT', 'localhost');
    const port = this.config.get<number>('MINIO_PORT', 9000);
    const url = `http://${endpoint}:${port}/${bucket}/${key}`;

    this.logger.log(`File uploaded: ${bucket}/${key}`);
    return { key, url, bucket };
  }

  async deleteFile(bucket: string, key: string) {
    await this.client.removeObject(bucket, key);
  }

  validateMimeType(mimeType: string): boolean {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    return allowed.includes(mimeType);
  }
}
