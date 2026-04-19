import { z } from 'zod';

export const eventTypeSchema = z.enum([
  'message.created',
  'message.edited',
  'message.deleted',
  'chat.updated',
  'membership.added',
  'membership.removed',
  'profile.updated',
  'blackboard.created',
  'blackboard.updated',
  'event.created',
  'event.updated',
  'event.cancelled',
  'club.updated',
  'join_request.updated',
]);

export type EventType = z.infer<typeof eventTypeSchema>;
