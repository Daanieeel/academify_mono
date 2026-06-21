// `MlsParty` is the real OpenMLS-backed wasm32 binding (crates/mls-wasm),
// rebuilt by `bun run build:wasm`. It covers exactly the 2-party vertical
// slice (create group, add one member, encrypt/decrypt) — no remove_members,
// multi-device, or persistent storage provider yet.
export { MlsParty } from './src/wasm/mls_wasm';

export type GroupId = string;

export type MlsEpoch = number;

export interface MlsMember {
  userId: string;
  leafIndex: number;
  keyPackageRef: string;
}

export interface MlsGroupState {
  groupId: GroupId;
  epoch: MlsEpoch;
  members: MlsMember[];
}

export interface MlsCommitMessage {
  groupId: GroupId;
  epoch: MlsEpoch;
  senderLeafIndex: number;
  ciphertext: string;
}
