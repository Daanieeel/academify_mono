import { and, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { openWithPrivateKey, type ComplianceKeyPair } from '@repo/crypto';
import {
  auditLog,
  chatMembers,
  classes,
  classMemberships,
  complianceKeys,
  db,
  reportApprovals,
  reportPackages,
  reports,
  roleBindings,
} from '@repo/database';

import { authMiddleware } from '../auth-middleware';
import { env } from '../env';

const REVIEW_WINDOW_MS = 24 * 60 * 60 * 1000;

async function isAdmin(
  userId: string,
  institutionId: string,
): Promise<boolean> {
  const bindings = await db
    .select({ role: roleBindings.role })
    .from(roleBindings)
    .where(
      and(
        eq(roleBindings.userId, userId),
        eq(roleBindings.institutionId, institutionId),
      ),
    );

  return bindings.some(
    (binding) => binding.role === 'admin' || binding.role === 'headmaster',
  );
}

// "The reporter's Klassenlehrer" — derived from the reporter's active class
// memberships, not a role the caller can self-assert.
async function isHeadTeacherOfReporter(
  userId: string,
  reporterUserId: string,
): Promise<boolean> {
  const rows = await db
    .select({ headTeacherUserId: classes.headTeacherUserId })
    .from(classMemberships)
    .innerJoin(classes, eq(classes.id, classMemberships.classId))
    .where(
      and(
        eq(classMemberships.userId, reporterUserId),
        eq(classMemberships.state, 'active'),
      ),
    );

  return rows.some((row) => row.headTeacherUserId === userId);
}

export const reportsRoutes = new Elysia()
  .use(authMiddleware)
  .post(
    '/reports',
    async ({ body, userId, institutionId, status }) => {
      if (!institutionId) {
        return status(403, { error: 'no institution profile for this user' });
      }

      const [membership] = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(
          and(
            eq(chatMembers.chatId, body.chat_id),
            eq(chatMembers.userId, userId),
            eq(chatMembers.state, 'active'),
          ),
        );

      if (!membership) {
        return status(403, { error: 'not a member of this chat' });
      }

      const report = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(reports)
          .values({
            institutionId,
            reporterUserId: userId,
            reportedMessageId: body.reported_message_id,
            chatId: body.chat_id,
          })
          .returning();

        await tx.insert(reportPackages).values({
          reportId: created!.id,
          encryptedPackage: Buffer.from(body.encrypted_package, 'base64url'),
          complianceKeyVersion: body.compliance_key_version,
          contentHash: body.content_hash,
        });

        return created!;
      });

      return { report_id: report.id, status: report.status };
    },
    {
      body: t.Object({
        reported_message_id: t.String({ format: 'uuid' }),
        chat_id: t.String({ minLength: 1 }),
        encrypted_package: t.String({ minLength: 1 }),
        compliance_key_version: t.Integer({ minimum: 1 }),
        content_hash: t.String({ minLength: 1 }),
      }),
    },
  )
  .post(
    '/reports/:id/review',
    async ({ params, userId, institutionId, status }) => {
      if (!institutionId) {
        return status(403, { error: 'no institution profile for this user' });
      }

      const [report] = await db
        .select()
        .from(reports)
        .where(
          and(
            eq(reports.id, params.id),
            eq(reports.institutionId, institutionId),
          ),
        );

      if (!report) {
        return status(404, { error: 'report not found' });
      }

      if (report.status === 'resolved' || report.status === 'dismissed') {
        return status(409, { error: `report already ${report.status}` });
      }

      const admin = await isAdmin(userId, institutionId);
      const headTeacher = await isHeadTeacherOfReporter(
        userId,
        report.reporterUserId,
      );

      if (!admin && !headTeacher) {
        return status(403, {
          error: 'must be an admin or the reporter’s Klassenlehrer to review',
        });
      }

      const approverRole = admin ? 'admin' : 'head_teacher';

      const existingApprovals = await db
        .select()
        .from(reportApprovals)
        .where(eq(reportApprovals.reportId, report.id));

      if (
        existingApprovals.some((approval) => approval.approverUserId === userId)
      ) {
        return status(409, { error: 'you have already approved this report' });
      }

      const now = Date.now();
      const validPriorApprovals = existingApprovals.filter(
        (approval) => now - approval.approvedAt.getTime() <= REVIEW_WINDOW_MS,
      );

      await db.insert(reportApprovals).values({
        reportId: report.id,
        approverUserId: userId,
        approverRole,
      });
      if (report.status === 'pending') {
        await db
          .update(reports)
          .set({ status: 'reviewing' })
          .where(eq(reports.id, report.id));
      }

      const hasAdminApproval =
        validPriorApprovals.some(
          (approval) => approval.approverRole === 'admin',
        ) || admin;
      const hasHeadTeacherApproval =
        validPriorApprovals.some(
          (approval) => approval.approverRole === 'head_teacher',
        ) || headTeacher;
      const distinctApprovers = new Set([
        ...validPriorApprovals.map((approval) => approval.approverUserId),
        userId,
      ]);

      if (
        !hasAdminApproval ||
        !hasHeadTeacherApproval ||
        distinctApprovers.size < 2
      ) {
        return {
          status: 'awaiting_second_approval' as const,
          approvals_recorded: distinctApprovers.size,
        };
      }

      if (!env.COMPLIANCE_PRIVATE_KEY) {
        return status(500, { error: 'compliance private key not configured' });
      }

      const [reportPackage] = await db
        .select()
        .from(reportPackages)
        .where(eq(reportPackages.reportId, report.id));
      const [complianceKey] = await db
        .select()
        .from(complianceKeys)
        .where(
          and(
            eq(complianceKeys.institutionId, institutionId),
            eq(complianceKeys.keyVersion, reportPackage!.complianceKeyVersion),
          ),
        );

      if (!reportPackage || !complianceKey) {
        return status(500, {
          error: 'report package or compliance key missing',
        });
      }

      const keyPair: ComplianceKeyPair = {
        publicKey: complianceKey.publicKey,
        privateKey: Buffer.from(env.COMPLIANCE_PRIVATE_KEY, 'base64url'),
      };

      const plaintext = openWithPrivateKey(
        reportPackage.encryptedPackage.toString('base64url'),
        keyPair,
      );

      await db.transaction(async (tx) => {
        await tx
          .update(reports)
          .set({
            status: 'resolved',
            resolvedBy: userId,
            resolvedAt: new Date(),
          })
          .where(eq(reports.id, report.id));

        await tx.insert(auditLog).values({
          institutionId,
          actorUserId: userId,
          action: 'report.decrypted',
          targetType: 'report',
          targetId: report.id,
          metadata: {
            approvers: [...distinctApprovers],
            reported_message_id: report.reportedMessageId,
          },
        });
      });

      return { status: 'approved' as const, plaintext };
    },
    { params: t.Object({ id: t.String({ format: 'uuid' }) }) },
  );
