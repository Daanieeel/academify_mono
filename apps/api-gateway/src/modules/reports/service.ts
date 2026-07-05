import { and, eq } from 'drizzle-orm';
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
import { AppError } from '../../plugins/error';
import { env } from '../../env';

const REVIEW_WINDOW_MS = 24 * 60 * 60 * 1000;

export class ReportsService {
  private static async isAdmin(
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

  private static async isHeadTeacherOfReporter(
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

  static async submitReport(
    userId: string,
    institutionId: string | null,
    reportedMessageId: string,
    chatId: string,
    encryptedPackage: string,
    complianceKeyVersion: number,
    contentHash: string,
  ) {
    if (!institutionId) {
      throw new AppError(
        403,
        'NO_INSTITUTION_PROFILE',
        'no institution profile for this user',
      );
    }

    const [membership] = await db
      .select({ userId: chatMembers.userId })
      .from(chatMembers)
      .where(
        and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, userId),
          eq(chatMembers.state, 'active'),
        ),
      );

    if (!membership) {
      throw new AppError(403, 'NOT_CHAT_MEMBER', 'not a member of this chat');
    }

    const report = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(reports)
        .values({
          institutionId,
          reporterUserId: userId,
          reportedMessageId,
          chatId,
        })
        .returning();

      if (!created) {
        throw new Error('Failed to create report');
      }

      await tx.insert(reportPackages).values({
        reportId: created.id,
        encryptedPackage: Buffer.from(encryptedPackage, 'base64url'),
        complianceKeyVersion,
        contentHash,
      });

      return created;
    });

    return { report_id: report.id, status: report.status };
  }

  static async reviewReport(
    userId: string,
    institutionId: string | null,
    reportId: string,
  ) {
    if (!institutionId) {
      throw new AppError(
        403,
        'NO_INSTITUTION_PROFILE',
        'no institution profile for this user',
      );
    }

    const [report] = await db
      .select()
      .from(reports)
      .where(
        and(eq(reports.id, reportId), eq(reports.institutionId, institutionId)),
      );

    if (!report) {
      throw new AppError(404, 'REPORT_NOT_FOUND', 'report not found');
    }

    if (report.status === 'resolved' || report.status === 'dismissed') {
      throw new AppError(
        409,
        'REPORT_ALREADY_PROCESSED',
        `report already ${report.status}`,
      );
    }

    const admin = await ReportsService.isAdmin(userId, institutionId);
    const headTeacher = await ReportsService.isHeadTeacherOfReporter(
      userId,
      report.reporterUserId,
    );

    if (!admin && !headTeacher) {
      throw new AppError(
        403,
        'UNAUTHORIZED_REVIEWER',
        'must be an admin or the reporter’s Klassenlehrer to review',
      );
    }

    const approverRole = admin ? 'admin' : 'head_teacher';

    const existingApprovals = await db
      .select()
      .from(reportApprovals)
      .where(eq(reportApprovals.reportId, report.id));

    if (
      existingApprovals.some((approval) => approval.approverUserId === userId)
    ) {
      throw new AppError(
        409,
        'ALREADY_APPROVED',
        'you have already approved this report',
      );
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
      throw new AppError(
        500,
        'COMPLIANCE_KEY_MISSING',
        'compliance private key not configured',
      );
    }

    const [reportPackage] = await db
      .select()
      .from(reportPackages)
      .where(eq(reportPackages.reportId, report.id));

    if (!reportPackage) {
      throw new AppError(500, 'REPORT_PACKAGE_ERROR', 'report package missing');
    }

    const [complianceKey] = await db
      .select()
      .from(complianceKeys)
      .where(
        and(
          eq(complianceKeys.institutionId, institutionId),
          eq(complianceKeys.keyVersion, reportPackage.complianceKeyVersion),
        ),
      );

    if (!complianceKey) {
      throw new AppError(500, 'REPORT_PACKAGE_ERROR', 'compliance key missing');
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
  }
}
