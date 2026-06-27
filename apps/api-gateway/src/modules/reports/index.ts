import { Elysia } from 'elysia';
import { authMiddleware } from '../../plugins/auth';
import { ReportsService } from './service';
import { PostReportsSchema, ReportIdParamsSchema } from './model';

export const reportsRoutes = new Elysia()
  .use(authMiddleware)
  .post(
    '/reports',
    ({ body, userId, institutionId }) => {
      return ReportsService.submitReport(
        userId,
        institutionId,
        body.reported_message_id,
        body.chat_id,
        body.encrypted_package,
        body.compliance_key_version,
        body.content_hash,
      );
    },
    { body: PostReportsSchema },
  )
  .post(
    '/reports/:id/review',
    ({ params, userId, institutionId }) => {
      return ReportsService.reviewReport(userId, institutionId, params.id);
    },
    { params: ReportIdParamsSchema },
  );
