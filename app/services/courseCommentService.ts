import { and, eq } from "drizzle-orm";
import { db } from "~/db";
import { courseComments, courses, users } from "~/db/schema";
import { isUserEnrolled } from "~/services/enrollmentService";

export const COMMENT_BODY_MAX = 2000;

export class CommentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommentError";
  }
}

export type CourseCommentRecord = {
  id: number;
  userId: number;
  authorName: string;
  avatarUrl: string | null;
  body: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  replies: CourseCommentRecord[];
};

type CourseRef = { id: number; instructorId: number };

export function canViewCourseComments(
  userId: number,
  courseId: number,
  instructorId: number
): boolean {
  return userId === instructorId || isUserEnrolled(userId, courseId);
}

export function normalizeCommentBody(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new CommentError("Comment cannot be empty.");
  }
  if (trimmed.length > COMMENT_BODY_MAX) {
    throw new CommentError("Comment must be 2000 characters or fewer.");
  }
  return trimmed;
}

function requireCourse(courseId: number): CourseRef {
  const course = db
    .select({ id: courses.id, instructorId: courses.instructorId })
    .from(courses)
    .where(eq(courses.id, courseId))
    .get();

  if (!course) {
    throw new CommentError("Course not found.");
  }

  return course;
}

function assertParticipant(userId: number, course: CourseRef) {
  if (!canViewCourseComments(userId, course.id, course.instructorId)) {
    throw new CommentError("You do not have access to comments on this course.");
  }
}

function getCommentRow(id: number) {
  return db
    .select()
    .from(courseComments)
    .where(eq(courseComments.id, id))
    .get();
}

// Replies always attach to the top-level comment, even when the target is itself a reply.
function resolveRootId(courseId: number, parentId: number): number {
  const parent = getCommentRow(parentId);
  if (!parent || parent.courseId !== courseId) {
    throw new CommentError("That comment cannot be replied to.");
  }

  if (parent.parentId == null) return parent.id;

  const root = getCommentRow(parent.parentId);
  if (!root || root.courseId !== courseId || root.parentId != null) {
    throw new CommentError("That comment cannot be replied to.");
  }

  return root.id;
}

export function createCourseComment(input: {
  courseId: number;
  userId: number;
  body: string;
  parentId?: number | null;
}) {
  const course = requireCourse(input.courseId);
  assertParticipant(input.userId, course);

  const body = normalizeCommentBody(input.body);
  const parentId =
    input.parentId == null ? null : resolveRootId(course.id, input.parentId);
  const now = new Date().toISOString();

  return db
    .insert(courseComments)
    .values({
      courseId: course.id,
      userId: input.userId,
      parentId,
      body,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
}

function requireOwnComment(commentId: number, courseId: number, userId: number) {
  const course = requireCourse(courseId);
  assertParticipant(userId, course);

  const comment = getCommentRow(commentId);
  if (!comment || comment.courseId !== courseId) {
    throw new CommentError("Comment not found.");
  }
  if (comment.userId !== userId) {
    throw new CommentError("You can only change your own comment.");
  }
  if (comment.deletedAt != null) {
    throw new CommentError("This comment was deleted.");
  }

  return comment;
}

export function updateCourseComment(input: {
  commentId: number;
  courseId: number;
  userId: number;
  body: string;
}) {
  const existing = requireOwnComment(
    input.commentId,
    input.courseId,
    input.userId
  );
  const body = normalizeCommentBody(input.body);
  let updatedAt = new Date().toISOString();
  if (updatedAt === existing.createdAt) {
    updatedAt = new Date(Date.parse(existing.createdAt) + 1).toISOString();
  }

  return db
    .update(courseComments)
    .set({ body, updatedAt })
    .where(eq(courseComments.id, existing.id))
    .returning()
    .get();
}

export function deleteCourseComment(input: {
  commentId: number;
  courseId: number;
  userId: number;
}) {
  const existing = requireOwnComment(
    input.commentId,
    input.courseId,
    input.userId
  );

  if (existing.parentId != null) {
    db.delete(courseComments).where(eq(courseComments.id, existing.id)).run();
    return { deleted: true as const, tombstoned: false as const };
  }

  const reply = db
    .select({ id: courseComments.id })
    .from(courseComments)
    .where(eq(courseComments.parentId, existing.id))
    .get();

  if (!reply) {
    db.delete(courseComments).where(eq(courseComments.id, existing.id)).run();
    return { deleted: true as const, tombstoned: false as const };
  }

  const now = new Date().toISOString();
  db.update(courseComments)
    .set({ body: null, deletedAt: now, updatedAt: now })
    .where(eq(courseComments.id, existing.id))
    .run();

  return { deleted: true as const, tombstoned: true as const };
}

function byNewest(a: { createdAt: string; id: number }, b: { createdAt: string; id: number }) {
  const byTime = b.createdAt.localeCompare(a.createdAt);
  if (byTime !== 0) return byTime;
  return b.id - a.id;
}

function byOldest(a: { createdAt: string; id: number }, b: { createdAt: string; id: number }) {
  const byTime = a.createdAt.localeCompare(b.createdAt);
  if (byTime !== 0) return byTime;
  return a.id - b.id;
}

export function getCourseComments(courseId: number): CourseCommentRecord[] {
  const rows = db
    .select({
      id: courseComments.id,
      userId: courseComments.userId,
      parentId: courseComments.parentId,
      body: courseComments.body,
      createdAt: courseComments.createdAt,
      updatedAt: courseComments.updatedAt,
      deletedAt: courseComments.deletedAt,
      authorName: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(courseComments)
    .innerJoin(users, eq(courseComments.userId, users.id))
    .where(eq(courseComments.courseId, courseId))
    .all();

  const repliesByParent = new Map<number, typeof rows>();
  const roots = [];

  for (const row of rows) {
    if (row.parentId == null) {
      roots.push(row);
      continue;
    }
    const list = repliesByParent.get(row.parentId) ?? [];
    list.push(row);
    repliesByParent.set(row.parentId, list);
  }

  roots.sort(byNewest);

  return roots.map((root) => ({
    id: root.id,
    userId: root.userId,
    authorName: root.authorName,
    avatarUrl: root.avatarUrl,
    body: root.deletedAt ? null : root.body,
    createdAt: root.createdAt,
    updatedAt: root.updatedAt,
    deletedAt: root.deletedAt,
    replies: (repliesByParent.get(root.id) ?? []).sort(byOldest).map((reply) => ({
      id: reply.id,
      userId: reply.userId,
      authorName: reply.authorName,
      avatarUrl: reply.avatarUrl,
      body: reply.body,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      deletedAt: reply.deletedAt,
      replies: [],
    })),
  }));
}

export function findCourseComment(commentId: number, courseId: number) {
  return db
    .select()
    .from(courseComments)
    .where(and(eq(courseComments.id, commentId), eq(courseComments.courseId, courseId)))
    .get();
}
