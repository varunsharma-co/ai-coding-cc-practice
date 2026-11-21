import { describe, it, expect, beforeEach, vi } from "vitest";
import { and, eq } from "drizzle-orm";
import { createTestDb, seedBaseData } from "~/test/setup";
import * as schema from "~/db/schema";

let testDb: ReturnType<typeof createTestDb>;
let base: ReturnType<typeof seedBaseData>;

vi.mock("~/db", () => ({
  get db() {
    return testDb;
  },
}));

import {
  canViewCourseComments,
  createCourseComment,
  deleteCourseComment,
  findCourseComment,
  getCourseComments,
  updateCourseComment,
} from "./courseCommentService";

function enroll(userId: number, courseId: number) {
  testDb
    .insert(schema.enrollments)
    .values({ userId, courseId })
    .run();
}

function createUser(
  name: string,
  email: string,
  role: schema.UserRole = schema.UserRole.Student
) {
  return testDb
    .insert(schema.users)
    .values({ name, email, role })
    .returning()
    .get();
}

describe("courseCommentService", () => {
  beforeEach(() => {
    testDb = createTestDb();
    base = seedBaseData(testDb);
  });

  describe("canViewCourseComments", () => {
    it("allows the course instructor and enrolled students", () => {
      expect(
        canViewCourseComments(
          base.instructor.id,
          base.course.id,
          base.instructor.id
        )
      ).toBe(true);

      expect(
        canViewCourseComments(base.user.id, base.course.id, base.instructor.id)
      ).toBe(false);

      enroll(base.user.id, base.course.id);

      expect(
        canViewCourseComments(base.user.id, base.course.id, base.instructor.id)
      ).toBe(true);
    });
  });

  describe("createCourseComment", () => {
    it("lets an enrolled student post, including a duplicate body", () => {
      enroll(base.user.id, base.course.id);

      const first = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "  Hello  ",
      });
      const second = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Hello",
      });

      expect(first.body).toBe("Hello");
      expect(second.body).toBe("Hello");
      expect(first.parentId).toBeNull();
      expect(getCourseComments(base.course.id)).toHaveLength(2);
    });

    it("lets the course instructor post without an enrollment", () => {
      const comment = createCourseComment({
        courseId: base.course.id,
        userId: base.instructor.id,
        body: "Welcome",
      });

      expect(comment.userId).toBe(base.instructor.id);
    });

    it("rejects a student who is not enrolled", () => {
      expect(() =>
        createCourseComment({
          courseId: base.course.id,
          userId: base.user.id,
          body: "Nope",
        })
      ).toThrowError("You do not have access to comments on this course.");
    });

    it("rejects another instructor and an admin who is not enrolled", () => {
      const otherInstructor = createUser(
        "Other",
        "other@example.com",
        schema.UserRole.Instructor
      );
      const admin = createUser("Admin", "admin@example.com", schema.UserRole.Admin);

      expect(() =>
        createCourseComment({
          courseId: base.course.id,
          userId: otherInstructor.id,
          body: "Hi",
        })
      ).toThrowError("You do not have access to comments on this course.");

      expect(() =>
        createCourseComment({
          courseId: base.course.id,
          userId: admin.id,
          body: "Hi",
        })
      ).toThrowError("You do not have access to comments on this course.");

      enroll(admin.id, base.course.id);
      expect(
        createCourseComment({
          courseId: base.course.id,
          userId: admin.id,
          body: "Hi",
        }).userId
      ).toBe(admin.id);
    });

    it("rejects an empty comment and a comment over 2000 characters", () => {
      enroll(base.user.id, base.course.id);

      expect(() =>
        createCourseComment({
          courseId: base.course.id,
          userId: base.user.id,
          body: "   ",
        })
      ).toThrowError("Comment cannot be empty.");

      expect(() =>
        createCourseComment({
          courseId: base.course.id,
          userId: base.user.id,
          body: "a".repeat(2001),
        })
      ).toThrowError("Comment must be 2000 characters or fewer.");

      expect(
        createCourseComment({
          courseId: base.course.id,
          userId: base.user.id,
          body: "a".repeat(2000),
        }).body
      ).toHaveLength(2000);
    });

    it("attaches a reply to the reply's top-level comment", () => {
      enroll(base.user.id, base.course.id);

      const root = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Root",
      });
      const reply = createCourseComment({
        courseId: base.course.id,
        userId: base.instructor.id,
        body: "Reply",
        parentId: root.id,
      });
      const nested = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Nested",
        parentId: reply.id,
      });

      expect(reply.parentId).toBe(root.id);
      expect(nested.parentId).toBe(root.id);

      const [thread] = getCourseComments(base.course.id);
      expect(thread.replies.map((item) => item.body)).toEqual(["Reply", "Nested"]);
    });

    it("rejects a reply to a comment on another course", () => {
      enroll(base.user.id, base.course.id);
      const other = testDb
        .insert(schema.courses)
        .values({
          title: "Other",
          slug: "other-course",
          description: "Other",
          instructorId: base.instructor.id,
          categoryId: base.category.id,
          status: schema.CourseStatus.Published,
        })
        .returning()
        .get();
      enroll(base.user.id, other.id);

      const root = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Root",
      });

      expect(() =>
        createCourseComment({
          courseId: other.id,
          userId: base.user.id,
          body: "Cross",
          parentId: root.id,
        })
      ).toThrowError("That comment cannot be replied to.");
      expect(getCourseComments(other.id)).toHaveLength(0);
    });
  });

  describe("getCourseComments", () => {
    it("lists newest top-level comments first and oldest replies first", () => {
      enroll(base.user.id, base.course.id);

      const first = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "First",
      });
      createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "First reply",
        parentId: first.id,
      });
      createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Second reply",
        parentId: first.id,
      });
      createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Second",
      });

      const threads = getCourseComments(base.course.id);
      expect(threads.map((thread) => thread.body)).toEqual(["Second", "First"]);
      expect(threads[1].replies.map((reply) => reply.body)).toEqual([
        "First reply",
        "Second reply",
      ]);
    });

    it("shows the author's current name", () => {
      enroll(base.user.id, base.course.id);
      createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Hello",
      });

      testDb
        .update(schema.users)
        .set({ name: "Renamed Student", avatarUrl: "https://example.com/a.png" })
        .where(eq(schema.users.id, base.user.id))
        .run();

      const [thread] = getCourseComments(base.course.id);
      expect(thread.authorName).toBe("Renamed Student");
      expect(thread.avatarUrl).toBe("https://example.com/a.png");
    });
  });

  describe("updateCourseComment", () => {
    it("lets the author edit while they still have access", () => {
      enroll(base.user.id, base.course.id);
      const comment = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Before",
      });

      const updated = updateCourseComment({
        commentId: comment.id,
        courseId: base.course.id,
        userId: base.user.id,
        body: "After",
      });

      expect(updated.body).toBe("After");
      expect(updated.createdAt).toBe(comment.createdAt);
      expect(updated.updatedAt).not.toBe(comment.createdAt);
    });

    it("rejects edits by someone else, after unenroll, and after a tombstone", () => {
      enroll(base.user.id, base.course.id);
      const comment = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Mine",
      });
      createCourseComment({
        courseId: base.course.id,
        userId: base.instructor.id,
        body: "Reply",
        parentId: comment.id,
      });

      expect(() =>
        updateCourseComment({
          commentId: comment.id,
          courseId: base.course.id,
          userId: base.instructor.id,
          body: "Taken",
        })
      ).toThrowError("You can only change your own comment.");

      testDb
        .delete(schema.enrollments)
        .where(
          and(
            eq(schema.enrollments.userId, base.user.id),
            eq(schema.enrollments.courseId, base.course.id)
          )
        )
        .run();

      expect(() =>
        updateCourseComment({
          commentId: comment.id,
          courseId: base.course.id,
          userId: base.user.id,
          body: "Later",
        })
      ).toThrowError("You do not have access to comments on this course.");

      enroll(base.user.id, base.course.id);
      deleteCourseComment({
        commentId: comment.id,
        courseId: base.course.id,
        userId: base.user.id,
      });

      expect(() =>
        updateCourseComment({
          commentId: comment.id,
          courseId: base.course.id,
          userId: base.user.id,
          body: "Revive",
        })
      ).toThrowError("This comment was deleted.");
    });
  });

  describe("deleteCourseComment", () => {
    it("removes a reply and a top-level comment with no replies", () => {
      enroll(base.user.id, base.course.id);
      const root = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Root",
      });
      const reply = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Reply",
        parentId: root.id,
      });

      deleteCourseComment({
        commentId: reply.id,
        courseId: base.course.id,
        userId: base.user.id,
      });
      expect(findCourseComment(reply.id, base.course.id)).toBeUndefined();

      deleteCourseComment({
        commentId: root.id,
        courseId: base.course.id,
        userId: base.user.id,
      });
      expect(getCourseComments(base.course.id)).toHaveLength(0);
    });

    it("tombstones a top-level comment that has replies and keeps the replies", () => {
      enroll(base.user.id, base.course.id);
      const root = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Root",
      });
      createCourseComment({
        courseId: base.course.id,
        userId: base.instructor.id,
        body: "Still here",
        parentId: root.id,
      });

      const result = deleteCourseComment({
        commentId: root.id,
        courseId: base.course.id,
        userId: base.user.id,
      });

      expect(result.tombstoned).toBe(true);
      const stored = findCourseComment(root.id, base.course.id);
      expect(stored?.body).toBeNull();
      expect(stored?.deletedAt).toBeTruthy();

      const [thread] = getCourseComments(base.course.id);
      expect(thread.body).toBeNull();
      expect(thread.deletedAt).toBeTruthy();
      expect(thread.authorName).toBe("Test User");
      expect(thread.replies.map((reply) => reply.body)).toEqual(["Still here"]);

      expect(() =>
        deleteCourseComment({
          commentId: root.id,
          courseId: base.course.id,
          userId: base.user.id,
        })
      ).toThrowError("This comment was deleted.");

      const followUp = createCourseComment({
        courseId: base.course.id,
        userId: base.instructor.id,
        body: "After delete",
        parentId: root.id,
      });
      expect(followUp.parentId).toBe(root.id);
    });

    it("rejects a delete after the author unenrolls", () => {
      enroll(base.user.id, base.course.id);
      const comment = createCourseComment({
        courseId: base.course.id,
        userId: base.user.id,
        body: "Mine",
      });

      testDb
        .delete(schema.enrollments)
        .where(
          and(
            eq(schema.enrollments.userId, base.user.id),
            eq(schema.enrollments.courseId, base.course.id)
          )
        )
        .run();

      expect(() =>
        deleteCourseComment({
          commentId: comment.id,
          courseId: base.course.id,
          userId: base.user.id,
        })
      ).toThrowError("You do not have access to comments on this course.");
      expect(findCourseComment(comment.id, base.course.id)?.body).toBe("Mine");
    });
  });
});
