import { createBlindIndex } from "@repo/crypto";
import { z } from "zod";

const sessionSchema = z.object({
  userId: z.string().min(1),
  issuedAt: z.string().datetime(),
  signature: z.string().min(1),
});

export type SessionPayload = z.infer<typeof sessionSchema>;

export const createSessionId = (userId: string): string => {
  return createBlindIndex(`session:${userId}:${Date.now()}`);
};

export const parseSessionPayload = (payload: unknown): SessionPayload => {
  return sessionSchema.parse(payload);
};
