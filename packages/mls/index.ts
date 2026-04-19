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
