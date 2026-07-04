import { api } from './api-client';

/**
 * Uploads a file directly to S3 using a presigned URL.
 * In a React Native environment, `fileUri` is expected to be a local `file://` path.
 * In a web environment, we could modify this to accept a File or Blob.
 */
export async function uploadToS3(
  presignedUrl: string,
  fileUri: string,
  contentType: string,
) {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: blob,
    headers: {
      'Content-Type': contentType,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload to S3: ${uploadResponse.statusText}`);
  }

  return true;
}

/**
 * Helper flow for uploading an institution asset (avatar or banner).
 * 1. Requests a presigned URL from our backend
 * 2. Uploads the file directly to S3 via the presigned URL
 * 3. Returns the public URL that can be saved to the institution profile
 */
export async function uploadInstitutionAsset(
  institutionId: string,
  assetType: 'avatar' | 'banner',
  fileUri: string,
  contentType: string,
): Promise<string> {
  // 1. Get presigned URL
  const { data, error } = await api.institutions[institutionId].assets[
    'upload-url'
  ].post({
    assetType,
    contentType,
  });

  if (error || !data) {
    throw new Error(
      `Failed to get presigned URL: ${error ? JSON.stringify(error) : 'No data'}`,
    );
  }

  const { uploadUrl, publicUrl } = data;

  // 2. Upload the file to S3
  await uploadToS3(uploadUrl, fileUri, contentType);

  // 3. Return the public URL to be saved in the database
  return publicUrl;
}
