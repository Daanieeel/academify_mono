// Hermes (React Native's JS engine) has neither Node's `Buffer` nor the web's
// `atob`/`btoa` globally available, so binary<->base64 conversion needs a
// from-scratch implementation here (the MLS WebView bridge and the gateway's
// REST/WS wire format both move ciphertext as base64/base64url strings).

const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    result += CHARS[b0 >> 2];
    result += CHARS[((b0 & 0x03) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    result +=
      b1 === undefined
        ? '='
        : CHARS[((b1 & 0x0f) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    result += b2 === undefined ? '=' : CHARS[b2 & 0x3f];
  }
  return result;
}

export function base64ToBytes(value: string): Uint8Array {
  const clean = value.replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const index = CHARS.indexOf(char);
    if (index === -1) {
      continue;
    }
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlToBytes(value: string): Uint8Array {
  return base64ToBytes(value.replace(/-/g, '+').replace(/_/g, '/'));
}
