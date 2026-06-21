import { z } from 'zod';

export const jobPayloadSchema = z.discriminatedUnion('command', [
  z
    .object({
      command: z.literal('SEND_MESSAGE'),
      // Client-generated UUID, carried through gateway -> queue -> worker so
      // the insert is idempotent on retry (ON CONFLICT DO NOTHING on this id).
      message_id: z.uuid(),
      chat_id: z.string().min(1),
      sender_user_id: z.string().min(1),
      sender_device_id: z.string().min(1),
      mls_epoch: z.number().int().nonnegative(),
      // Ciphertext produced client-side (MLS application message); worker
      // never decrypts it. base64url-encoded for safe transport over the queue.
      ciphertext: z.string().min(1),
      content_type: z.string().min(1),
    })
    .strict(),
  z
    .object({
      command: z.literal('MEMBERSHIP_CHANGED'),
      chat_id: z.string().min(1),
      user_id: z.string().min(1),
      action: z.enum(['added', 'removed']),
    })
    .strict(),
  z
    .object({
      command: z.literal('PROFILE_UPDATED'),
      user_id: z.string().min(1),
    })
    .strict(),
  z
    .object({
      command: z.literal('BLACKBOARD_POSTED'),
      institution_id: z.string().min(1),
      blackboard_post_id: z.string().min(1),
    })
    .strict(),
  z
    .object({
      command: z.literal('EVENT_UPDATED'),
      institution_id: z.string().min(1),
      event_id: z.string().min(1),
    })
    .strict(),
  z
    .object({
      command: z.literal('CLUB_UPDATED'),
      institution_id: z.string().min(1),
      club_id: z.string().min(1),
    })
    .strict(),
]);

export type JobPayload = z.infer<typeof jobPayloadSchema>;
