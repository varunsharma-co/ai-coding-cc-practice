import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "~/db";
import { courseRatings, courses } from "~/db/schema";
import { isUserEnrolled } from "~/services/enrollmentService";

// ─── Rating Service ───
// Star ratings only. One rating per student per course. Averages are shown
// wherever a course is displayed.
// Uses positional parameters (project convention).

export type RatingSummary = {
  average: number | null;
  count: number;
};

const emptySummary: RatingSummary = { average: null, count: 0 };

function roundAverage(value: number) {
  return Math.round(value * 10) / 10;
}

function toSummary(average: unknown, count: unknown): RatingSummary {
  const parsedCount = Number(count ?? 0);
  if (!Number.isFinite(parsedCount) || parsedCount <= 0) {
    return emptySummary;
  }

  const parsedAverage = Number(average);
  if (!Number.isFinite(parsedAverage)) {
    return emptySummary;
  }

  return {
    average: roundAverage(parsedAverage),
    count: parsedCount,
  };
}

export function getCourseRatingSummary(courseId: number): RatingSummary {
  const row = db
    .select({
      average: sql<number>`avg(${courseRatings.stars})`,
      count: sql<number>`count(*)`,
    })
    .from(courseRatings)
    .where(eq(courseRatings.courseId, courseId))
    .get();

  return toSummary(row?.average, row?.count);
}

export function getRatingSummariesForCourses(courseIds: number[]) {
  const summaries = new Map<number, RatingSummary>();
  if (courseIds.length === 0) return summaries;

  const rows = db
    .select({
      courseId: courseRatings.courseId,
      average: sql<number>`avg(${courseRatings.stars})`,
      count: sql<number>`count(*)`,
    })
    .from(courseRatings)
    .where(inArray(courseRatings.courseId, courseIds))
    .groupBy(courseRatings.courseId)
    .all();

  for (const row of rows) {
    summaries.set(row.courseId, toSummary(row.average, row.count));
  }

  return summaries;
}

export function ratingFor(
  summaries: Map<number, RatingSummary>,
  courseId: number
): RatingSummary {
  return summaries.get(courseId) ?? emptySummary;
}

export function getUserCourseRating(userId: number, courseId: number) {
  return db
    .select()
    .from(courseRatings)
    .where(
      and(eq(courseRatings.userId, userId), eq(courseRatings.courseId, courseId))
    )
    .get();
}

export function rateCourse(userId: number, courseId: number, stars: number) {
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new Error("Rating must be a whole number from 1 to 5");
  }

  const course = db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .get();
  if (!course) {
    throw new Error("Course not found");
  }

  if (course.instructorId === userId) {
    throw new Error("Instructors cannot rate their own course");
  }

  if (!isUserEnrolled(userId, courseId)) {
    throw new Error("Only enrolled students can rate this course");
  }

  const now = new Date().toISOString();

  return db
    .insert(courseRatings)
    .values({
      userId,
      courseId,
      stars,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [courseRatings.userId, courseRatings.courseId],
      set: {
        stars,
        updatedAt: now,
      },
    })
    .returning()
    .get();
}
