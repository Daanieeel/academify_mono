import { eq } from 'drizzle-orm';
import { db, profiles, institutions } from '@repo/database';

export class UsersService {
  static async getProfiles(userId: string) {
    const rows = await db
      .select({
        institutionId: profiles.institutionId,
        displayNameCiphertext: profiles.displayNameCiphertext,
        institutionName: institutions.displayName,
      })
      .from(profiles)
      .innerJoin(institutions, eq(institutions.id, profiles.institutionId))
      .where(eq(profiles.userId, userId));

    return {
      profiles: rows.map((row) => ({
        institution_id: row.institutionId,
        institution_name: row.institutionName,
        display_name: row.displayNameCiphertext,
      })),
    };
  }
}
