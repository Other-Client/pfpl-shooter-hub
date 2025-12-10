// src/lib/s3.ts
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const REGION = process.env.AWS_REGION!;
const BUCKET = process.env.AWS_S3_BUCKET!;

if (!REGION || !BUCKET) {
  console.warn("S3 env vars missing – uploads will fail.");
}

export const s3Client = new S3Client({ region: REGION });

export async function uploadBufferToS3(
  buffer: Buffer,
  contentType: string,
  prefix: string = "artifacts"
) {
  const key = `${prefix}/${randomUUID()}`;
  const params: PutObjectCommandInput = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));

  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}
