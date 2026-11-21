import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb, seedBaseData } from "~/test/setup";
import * as schema from "~/db/schema";

let testDb: ReturnType<typeof createTestDb>;
let base: ReturnType<typeof seedBaseData>;

vi.mock("~/db", () => ({
  get db() {
    return testDb;
  },
}));

import { enrollUser } from "./enrollmentService";
import {
  getCourseRatingSummary,
  getRatingSummariesForCourses,
  getUserCourseRating,
  rateCourse,
  ratingFor,
} from "./ratingService";

describe("ratingService", () => {
  beforeEach(() => {
    testDb = createTestDb();
    base = seedBaseData(testDb);
    enrollUser(base.user.id, base.course.id, false, false);
  });

  describe("rateCourse", () => {
    it("saves a star rating for an enrolled student", () => {
      const rating = rateCourse(base.user.id, base.course.id, 4);

      expect(rating.userId).toBe(base.user.id);
      expect(rating.courseId).toBe(base.course.id);
      expect(rating.stars).toBe(4);
    });

    it("replaces an existing rating instead of adding another", () => {
      rateCourse(base.user.id, base.course.id, 2);
      const updated = rateCourse(base.user.id, base.course.id, 5);

      expect(updated.stars).toBe(5);
      expect(getCourseRatingSummary(base.course.id)).toEqual({
        average: 5,
        count: 1,
      });
    });

    it("rejects ratings outside 1 to 5", () => {
      expect(() => rateCourse(base.user.id, base.course.id, 0)).toThrowError(
        "Rating must be a whole number from 1 to 5"
      );
      expect(() => rateCourse(base.user.id, base.course.id, 6)).toThrowError(
        "Rating must be a whole number from 1 to 5"
      );
      expect(() => rateCourse(base.user.id, base.course.id, 3.5)).toThrowError(
        "Rating must be a whole number from 1 to 5"
      );
    });

    it("rejects a student who is not enrolled", () => {
      const other = testDb
        .insert(schema.users)
        .values({
          name: "Other Student",
          email: "other@example.com",
          role: schema.UserRole.Student,
        })
        .returning()
        .get();

      expect(() => rateCourse(other.id, base.course.id, 5)).toThrowError(
        "Only enrolled students can rate this course"
      );
    });

    it("rejects the course instructor", () => {
      enrollUser(base.instructor.id, base.course.id, false, false);

      expect(() =>
        rateCourse(base.instructor.id, base.course.id, 5)
      ).toThrowError("Instructors cannot rate their own course");
    });

    it("rejects a missing course", () => {
      expect(() => rateCourse(base.user.id, 9999, 5)).toThrowError(
        "Course not found"
      );
    });
  });

  describe("summaries", () => {
    it("returns an empty summary when a course has no ratings", () => {
      expect(getCourseRatingSummary(base.course.id)).toEqual({
        average: null,
        count: 0,
      });
    });

    it("averages ratings from enrolled students", () => {
      const other = testDb
        .insert(schema.users)
        .values({
          name: "Other Student",
          email: "other@example.com",
          role: schema.UserRole.Student,
        })
        .returning()
        .get();
      enrollUser(other.id, base.course.id, false, false);

      rateCourse(base.user.id, base.course.id, 5);
      rateCourse(other.id, base.course.id, 4);

      expect(getCourseRatingSummary(base.course.id)).toEqual({
        average: 4.5,
        count: 2,
      });
      expect(getUserCourseRating(base.user.id, base.course.id)?.stars).toBe(5);
    });

    it("rounds the average to one decimal place", () => {
      const second = testDb
        .insert(schema.users)
        .values({
          name: "Second",
          email: "second@example.com",
          role: schema.UserRole.Student,
        })
        .returning()
        .get();
      const third = testDb
        .insert(schema.users)
        .values({
          name: "Third",
          email: "third@example.com",
          role: schema.UserRole.Student,
        })
        .returning()
        .get();
      enrollUser(second.id, base.course.id, false, false);
      enrollUser(third.id, base.course.id, false, false);

      rateCourse(base.user.id, base.course.id, 5);
      rateCourse(second.id, base.course.id, 5);
      rateCourse(third.id, base.course.id, 4);

      expect(getCourseRatingSummary(base.course.id).average).toBe(4.7);
    });

    it("loads summaries for several courses at once", () => {
      const otherCourse = testDb
        .insert(schema.courses)
        .values({
          title: "Another Course",
          slug: "another-course",
          description: "Second course",
          instructorId: base.instructor.id,
          categoryId: base.category.id,
          status: schema.CourseStatus.Published,
        })
        .returning()
        .get();
      enrollUser(base.user.id, otherCourse.id, false, false);

      rateCourse(base.user.id, base.course.id, 3);
      rateCourse(base.user.id, otherCourse.id, 1);

      const summaries = getRatingSummariesForCourses([
        base.course.id,
        otherCourse.id,
        9999,
      ]);

      expect(ratingFor(summaries, base.course.id)).toEqual({
        average: 3,
        count: 1,
      });
      expect(ratingFor(summaries, otherCourse.id)).toEqual({
        average: 1,
        count: 1,
      });
      expect(ratingFor(summaries, 9999)).toEqual({ average: null, count: 0 });
      expect(getRatingSummariesForCourses([]).size).toBe(0);
    });
  });
});
