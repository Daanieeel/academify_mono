import { describe, expect, it } from 'bun:test';

import {
  decryptText,
  encryptText,
  generateComplianceKeyPair,
  openWithPrivateKey,
  sealToPublicKey,
} from '../../index';

describe('encryptText / decryptText', () => {
  it('round-trips plaintext with a symmetric key', () => {
    const key = Buffer.alloc(32, 7);
    const ciphertext = encryptText('hello world', key);

    expect(decryptText(ciphertext, key)).toBe('hello world');
  });

  it('fails to decrypt with the wrong key', () => {
    const ciphertext = encryptText('hello world', Buffer.alloc(32, 1));

    expect(() => decryptText(ciphertext, Buffer.alloc(32, 2))).toThrow();
  });
});

describe('report-escrow envelope (sealToPublicKey / openWithPrivateKey)', () => {
  it('round-trips plaintext sealed to a compliance public key', () => {
    const keyPair = generateComplianceKeyPair();
    const sealed = sealToPublicKey(
      'reported message contents',
      keyPair.publicKey,
    );

    expect(openWithPrivateKey(sealed, keyPair)).toBe(
      'reported message contents',
    );
  });

  it('produces a different ciphertext for the same plaintext each time (fresh ephemeral key)', () => {
    const keyPair = generateComplianceKeyPair();

    const first = sealToPublicKey('same message', keyPair.publicKey);
    const second = sealToPublicKey('same message', keyPair.publicKey);

    expect(first).not.toBe(second);
  });

  it('rejects opening with the wrong compliance keypair', () => {
    const keyPair = generateComplianceKeyPair();
    const wrongKeyPair = generateComplianceKeyPair();
    const sealed = sealToPublicKey(
      'reported message contents',
      keyPair.publicKey,
    );

    expect(() => openWithPrivateKey(sealed, wrongKeyPair)).toThrow();
  });

  it('rejects a tampered envelope', () => {
    const keyPair = generateComplianceKeyPair();
    const sealed = sealToPublicKey(
      'reported message contents',
      keyPair.publicKey,
    );

    const tampered = Buffer.from(sealed, 'base64url');
    tampered[tampered.length - 1] ^= 0xff;

    expect(() =>
      openWithPrivateKey(tampered.toString('base64url'), keyPair),
    ).toThrow();
  });
});
