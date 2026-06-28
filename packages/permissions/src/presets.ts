import { type RoleDefinition } from './policy';

export const INSTITUTION_PRESETS: Record<
  string,
  Record<string, RoleDefinition>
> = {
  university: {
    student: {
      displayName: 'Student',
      rank: 10,
    },
    ta: {
      displayName: 'Teaching Assistant',
      rank: 30,
      inherits: ['student'],
      permissions: {
        'message:delete:any': true,
      },
    },
    professor: {
      displayName: 'Professor',
      rank: 50,
      inherits: ['teacher'],
    },
    admin: {
      displayName: 'Administrator',
      rank: 100,
      inherits: ['admin'],
    },
  },
  school: {
    student: {
      displayName: 'Student',
      rank: 10,
    },
    parent: {
      displayName: 'Parent',
      rank: 20,
    },
    teacher: {
      displayName: 'Teacher',
      rank: 50,
    },
    admin: {
      displayName: 'Administrator',
      rank: 100,
    },
  },
};
