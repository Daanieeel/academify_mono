import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createPrivateKey,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
  hkdfSync,
  randomBytes,
} from 'node:crypto';

const CIPHER_ALGO = 'aes-256-gcm';
const IV_SIZE = 12;
const TAG_SIZE = 16;
const AES_KEY_SIZE = 32;
const X25519_KEY_SIZE = 32;
// Domain-separates this HKDF usage from any other AES-key derivation in the
// system; bump the version suffix if the envelope format ever changes shape.
const HKDF_INFO = Buffer.from('academify:report-escrow:v1');

export const createBlindIndex = (value: string): string => {
  return createHash('sha256').update(value).digest('hex');
};

export const encryptText = (plaintext: string, key: Buffer): string => {
  const iv = randomBytes(IV_SIZE);
  const cipher = createCipheriv(CIPHER_ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
};

export const decryptText = (payload: string, key: Buffer): string => {
  const decoded = Buffer.from(payload, 'base64url');
  const iv = decoded.subarray(0, IV_SIZE);
  const tag = decoded.subarray(IV_SIZE, IV_SIZE + 16);
  const body = decoded.subarray(IV_SIZE + 16);
  const decipher = createDecipheriv(CIPHER_ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(body), decipher.final()]);
  return plaintext.toString('utf8');
};

export interface ComplianceKeyPair {
  publicKey: Buffer;
  privateKey: Buffer;
}

const publicKeyFromRaw = (rawPublicKey: Buffer) =>
  createPublicKey({
    key: { kty: 'OKP', crv: 'X25519', x: rawPublicKey.toString('base64url') },
    format: 'jwk',
  });

// X25519 JWK private keys require the matching public component (`x`)
// alongside the scalar (`d`); raw private-key bytes alone aren't enough to
// reconstruct a usable KeyObject, so callers must hold both halves together.
const privateKeyFromRaw = (rawPrivateKey: Buffer, rawPublicKey: Buffer) =>
  createPrivateKey({
    key: {
      kty: 'OKP',
      crv: 'X25519',
      x: rawPublicKey.toString('base64url'),
      d: rawPrivateKey.toString('base64url'),
    },
    format: 'jwk',
  });

const exportRawPublicKey = (
  publicKey: ReturnType<typeof createPublicKey>,
): Buffer => {
  const jwk: { x?: string } = publicKey.export({ format: 'jwk' });
  return Buffer.from(jwk.x ?? '', 'base64url');
};

const deriveAesKey = (
  sharedSecret: Buffer,
  ephemeralPublicKey: Buffer,
): Buffer =>
  Buffer.from(
    hkdfSync(
      'sha256',
      sharedSecret,
      ephemeralPublicKey,
      HKDF_INFO,
      AES_KEY_SIZE,
    ),
  );

export const generateComplianceKeyPair = (): ComplianceKeyPair => {
  const { publicKey, privateKey } = generateKeyPairSync('x25519');
  const privateJwk: { d?: string } = privateKey.export({ format: 'jwk' });
  return {
    publicKey: exportRawPublicKey(publicKey),
    privateKey: Buffer.from(privateJwk.d ?? '', 'base64url'),
  };
};

// Seals `plaintext` to `recipientPublicKey` using an ephemeral X25519 keypair
// (fresh per call) + HKDF + AES-256-GCM. Output layout:
// ephemeral_pubkey(32) || iv(12) || tag(16) || ciphertext.
// Only the holder of the matching private key can open it (see ADR-0006).
export const sealToPublicKey = (
  plaintext: string,
  recipientPublicKey: Buffer,
): string => {
  const ephemeral = generateKeyPairSync('x25519');
  const ephemeralPublicKeyBytes = exportRawPublicKey(ephemeral.publicKey);

  const sharedSecret = diffieHellman({
    privateKey: ephemeral.privateKey,
    publicKey: publicKeyFromRaw(recipientPublicKey),
  });
  const aesKey = deriveAesKey(sharedSecret, ephemeralPublicKeyBytes);

  const iv = randomBytes(IV_SIZE);
  const cipher = createCipheriv(CIPHER_ALGO, aesKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([ephemeralPublicKeyBytes, iv, tag, encrypted]).toString(
    'base64url',
  );
};

export const openWithPrivateKey = (
  sealed: string,
  recipientKeyPair: ComplianceKeyPair,
): string => {
  const decoded = Buffer.from(sealed, 'base64url');
  const ephemeralPublicKeyBytes = decoded.subarray(0, X25519_KEY_SIZE);
  const iv = decoded.subarray(X25519_KEY_SIZE, X25519_KEY_SIZE + IV_SIZE);
  const tag = decoded.subarray(
    X25519_KEY_SIZE + IV_SIZE,
    X25519_KEY_SIZE + IV_SIZE + TAG_SIZE,
  );
  const body = decoded.subarray(X25519_KEY_SIZE + IV_SIZE + TAG_SIZE);

  const recipientPrivateKey = privateKeyFromRaw(
    recipientKeyPair.privateKey,
    recipientKeyPair.publicKey,
  );
  const sharedSecret = diffieHellman({
    privateKey: recipientPrivateKey,
    publicKey: publicKeyFromRaw(ephemeralPublicKeyBytes),
  });
  const aesKey = deriveAesKey(sharedSecret, ephemeralPublicKeyBytes);

  const decipher = createDecipheriv(CIPHER_ALGO, aesKey, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(body), decipher.final()]);
  return plaintext.toString('utf8');
};
