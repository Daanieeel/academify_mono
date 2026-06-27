export const PERMISSIONS = {
  CREATE_GROUP: 'create_group',
  CREATE_CLUB: 'create_club',
  CREATE_BLACKBOARD_POST: 'create_blackboard_post',
  DELETE_OWN_MESSAGE: 'delete_own_message',
  DELETE_ANY_MESSAGE: 'delete_any_message',
  REPORT_MESSAGE: 'report_message',
  REVIEW_REPORT: 'review_report',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// We map each role to its default set of boolean permissions
export const DEFAULT_ROLE_PERMISSIONS: Record<
  string,
  Record<PermissionKey, boolean>
> = {
  student: {
    create_group: false,
    create_club: false,
    create_blackboard_post: false,
    delete_own_message: true,
    delete_any_message: false,
    report_message: true,
    review_report: false,
  },
  teacher: {
    create_group: true,
    create_club: true,
    create_blackboard_post: true,
    delete_own_message: true,
    delete_any_message: false,
    report_message: true,
    review_report: false,
  },
  admin: {
    create_group: true,
    create_club: true,
    create_blackboard_post: true,
    delete_own_message: true,
    delete_any_message: true,
    report_message: true,
    review_report: true,
  },
  headmaster: {
    create_group: true,
    create_club: true,
    create_blackboard_post: true,
    delete_own_message: true,
    delete_any_message: true,
    report_message: true,
    review_report: true,
  },
  compliance_officer: {
    create_group: false,
    create_club: false,
    create_blackboard_post: false,
    delete_own_message: false,
    delete_any_message: true,
    report_message: false,
    review_report: true,
  },
};
