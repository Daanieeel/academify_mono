export interface DatabaseClient {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
}

export const prisma = {
  async $connect() {
    return;
  },
  async $disconnect() {
    return;
  },
} satisfies DatabaseClient;
