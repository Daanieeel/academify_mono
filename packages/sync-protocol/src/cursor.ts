import { z } from 'zod';

// Cursor is transferred as a decimal string to avoid JSON bigint precision loss.
export const cursorSchema = z.string().regex(/^\d+$/);

export type Cursor = z.infer<typeof cursorSchema>;
