import { customType } from 'drizzle-orm/pg-core';

// Ciphertext / binary payloads (drizzle-orm pg-core has no built-in bytea type).
export const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea';
  },
});
