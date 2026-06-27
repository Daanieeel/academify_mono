import { Elysia } from 'elysia';
import { authMiddleware } from '../../plugins/auth';
import { MlsService } from './service';
import {
  ConsumeMlsKeyPackagesSchema,
  MlsGroupsChatIdParamsSchema,
  PostMlsDevicesSchema,
  PostMlsGroupsMembersBodySchema,
  PostMlsGroupsMembersParamsSchema,
  PostMlsGroupsSchema,
  PostMlsKeyPackagesSchema,
} from './model';

export const mlsRoutes = new Elysia()
  .use(authMiddleware)
  .post(
    '/mls/devices',
    ({ body, userId }) => {
      return MlsService.registerDevice(
        userId,
        body.label,
        body.identity_pubkey,
      );
    },
    { body: PostMlsDevicesSchema },
  )
  .delete('/mls/key-packages', ({ userId }) => {
    return MlsService.purgeUnconsumedKeyPackages(userId);
  })
  .post(
    '/mls/key-packages',
    ({ body, userId }) => {
      return MlsService.uploadKeyPackage(
        userId,
        body.device_id,
        body.key_package_bytes,
      );
    },
    { body: PostMlsKeyPackagesSchema },
  )
  .post(
    '/mls/key-packages/consume',
    ({ body }) => {
      return MlsService.consumeKeyPackage(body.user_id);
    },
    { body: ConsumeMlsKeyPackagesSchema },
  )
  .post(
    '/mls/groups',
    ({ body, userId }) => {
      return MlsService.createGroup(
        userId,
        body.chat_id,
        body.mls_group_id,
        body.cipher_suite,
        body.device_id,
      );
    },
    { body: PostMlsGroupsSchema },
  )
  .post(
    '/mls/groups/:chatId/members',
    ({ params, body, userId }) => {
      return MlsService.addGroupMember(
        userId,
        params.chatId,
        body.new_member_user_id,
        body.new_member_device_id,
        body.leaf_index,
        body.new_epoch,
        body.welcome_bytes,
      );
    },
    {
      params: PostMlsGroupsMembersParamsSchema,
      body: PostMlsGroupsMembersBodySchema,
    },
  )
  .get(
    '/mls/groups/:chatId/welcome',
    ({ params, userId }) => {
      return MlsService.getGroupWelcome(userId, params.chatId);
    },
    { params: MlsGroupsChatIdParamsSchema },
  )
  .get(
    '/mls/groups/:chatId',
    ({ params, userId }) => {
      return MlsService.getGroup(userId, params.chatId);
    },
    { params: MlsGroupsChatIdParamsSchema },
  );
