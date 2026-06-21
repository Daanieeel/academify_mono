import { pgEnum, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from './auth';
import { institutions } from './identity';

export const classMembershipRoleEnum = pgEnum('class_membership_role', [
  'student',
  'teacher',
]);

export const membershipStateEnum = pgEnum('membership_state', [
  'active',
  'removed',
]);

export const grades = pgTable('grades', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  name: text('name').notNull(),
});

export const subjects = pgTable('subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  name: text('name').notNull(),
});

// `headTeacherUserId` is the Klassenlehrer — the dual-auth report-escrow
// review path resolves through this column (see ADR-0006).
export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  name: text('name').notNull(),
  gradeId: uuid('grade_id').references(() => grades.id),
  headTeacherUserId: text('head_teacher_user_id')
    .notNull()
    .references(() => user.id),
});

export const classMemberships = pgTable(
  'class_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: classMembershipRoleEnum('role').notNull().default('student'),
    state: membershipStateEnum('state').notNull().default('active'),
  },
  (table) => [
    uniqueIndex('class_memberships_class_user_idx').on(
      table.classId,
      table.userId,
    ),
  ],
);

export const subjectAssignments = pgTable(
  'subject_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    subjectId: uuid('subject_id')
      .notNull()
      .references(() => subjects.id, { onDelete: 'cascade' }),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    teacherUserId: text('teacher_user_id')
      .notNull()
      .references(() => user.id),
  },
  (table) => [
    uniqueIndex('subject_assignments_subject_class_idx').on(
      table.subjectId,
      table.classId,
    ),
  ],
);
