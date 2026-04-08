import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

function getS3Config() {
  const region = process.env.S3_REGION || process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET;

  if (!region || !bucket) {
    throw new Error(
      "Missing required S3 configuration. Set S3_REGION and S3_BUCKET."
    );
  }

  return { region, bucket };
}

export async function uploadBufferToS3(
  buffer: Buffer,
  contentType: string,
  prefix: string = "artifacts"
) {
  const { region, bucket } = getS3Config();
  const s3Client = new S3Client({ region });
  const key = `${prefix}/${randomUUID()}`;
  const params: PutObjectCommandInput = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
