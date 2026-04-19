import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const CIPHER_ALGO = "aes-256-gcm";
const IV_SIZE = 12;

export const createBlindIndex = (value: string): string => {
  return createHash("sha256").update(value).digest("hex");
};

export const encryptText = (plaintext: string, key: Buffer): string => {
  const iv = randomBytes(IV_SIZE);
  const cipher = createCipheriv(CIPHER_ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
};

export const decryptText = (payload: string, key: Buffer): string => {
  const decoded = Buffer.from(payload, "base64url");
  const iv = decoded.subarray(0, IV_SIZE);
  const tag = decoded.subarray(IV_SIZE, IV_SIZE + 16);
  const body = decoded.subarray(IV_SIZE + 16);
  const decipher = createDecipheriv(CIPHER_ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(body), decipher.final()]);
  return plaintext.toString("utf8");
};
