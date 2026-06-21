import { describe, expect, it } from 'bun:test';

import { MlsParty } from '../../index';

function text(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

describe('MlsParty', () => {
  it('delivers an encrypted application message between two parties', () => {
    const alice = new MlsParty('alice');
    const bob = new MlsParty('bob');

    alice.create_group();
    const bobKeyPackage = bob.generate_key_package();
    const welcome = alice.add_member(bobKeyPackage);
    bob.join_from_welcome(welcome);

    const ciphertext = alice.encrypt(bytes('hello from alice'));
    const plaintext = bob.decrypt(ciphertext);

    expect(text(plaintext)).toBe('hello from alice');
  });

  it('delivers in both directions after the group is established', () => {
    const alice = new MlsParty('alice');
    const bob = new MlsParty('bob');

    alice.create_group();
    bob.join_from_welcome(alice.add_member(bob.generate_key_package()));

    const fromBob = alice.decrypt(bob.encrypt(bytes('hi alice, bob here')));
    expect(text(fromBob)).toBe('hi alice, bob here');
  });

  it('throws instead of encrypting when no group has been created or joined', () => {
    const carol = new MlsParty('carol');

    expect(() => carol.encrypt(bytes('oops'))).toThrow();
  });

  it('throws on a tampered ciphertext rather than returning corrupted plaintext', () => {
    const alice = new MlsParty('alice');
    const bob = new MlsParty('bob');

    alice.create_group();
    bob.join_from_welcome(alice.add_member(bob.generate_key_package()));

    const ciphertext = alice.encrypt(bytes('secret'));
    const tampered = new Uint8Array(ciphertext);
    tampered[tampered.length - 1] ^= 0xff;

    expect(() => bob.decrypt(tampered)).toThrow();
  });
});
