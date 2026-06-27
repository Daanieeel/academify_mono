export const ERROR_CODES = {
  ERR_FEATURE_DISABLED: 'ERR_FEATURE_DISABLED',
  ERR_PERMISSION_DENIED: 'ERR_PERMISSION_DENIED',
  ERR_CHAT_NOT_ALLOWED: 'ERR_CHAT_NOT_ALLOWED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class PermissionError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}
