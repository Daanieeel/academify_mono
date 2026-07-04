import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  BucketCannedACL,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId:
      process.env.MINIO_ROOT_USER ||
      process.env.AWS_ACCESS_KEY_ID ||
      'minioadmin',
    secretAccessKey:
      process.env.MINIO_ROOT_PASSWORD ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      'minioadmin',
  },
  forcePathStyle: true, // Necessary for MinIO
};

export const s3Client = new S3Client(s3Config);

export const PUBLIC_BUCKET_NAME = 'academify-public';

/**
 * Initializes the default buckets (e.g. academify-public) if they don't exist.
 * Should be called on application startup in development mode.
 */
export async function initializeBuckets() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: PUBLIC_BUCKET_NAME }));
    console.log(`Bucket ${PUBLIC_BUCKET_NAME} already exists.`);
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      console.log(`Bucket ${PUBLIC_BUCKET_NAME} does not exist. Creating...`);
      await s3Client.send(
        new CreateBucketCommand({
          Bucket: PUBLIC_BUCKET_NAME,
          ACL: BucketCannedACL.public_read,
        }),
      );

      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicRead',
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${PUBLIC_BUCKET_NAME}/*`],
          },
        ],
      };

      await s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: PUBLIC_BUCKET_NAME,
          Policy: JSON.stringify(policy),
        }),
      );

      console.log(
        `Bucket ${PUBLIC_BUCKET_NAME} created and configured for public access successfully.`,
      );
    } else {
      console.error('Error checking/creating bucket:', error);
    }
  }
}

/**
 * Generates a presigned URL for a client to upload a file directly to S3.
 */
export async function getPresignedUploadUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generates a public URL for a given bucket and key.
 * If using MinIO locally, this constructs the direct endpoint URL.
 */
export function getPublicUrl(bucket: string, key: string): string {
  // If S3_PUBLIC_URL is set, use it (e.g., a CDN or public minio proxy)
  if (process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL}/${bucket}/${key}`;
  }
  const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
  return `${endpoint}/${bucket}/${key}`;
}
