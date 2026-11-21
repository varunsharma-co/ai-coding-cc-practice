import { useEffect } from "react";
import { useFetcher } from "react-router";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

export type RatingSummary = {
  average: number | null;
  count: number;
};

function PartialStar({
  fraction,
  className,
}: {
  fraction: number;
  className: string;
}) {
  const clamped = Math.max(0, Math.min(1, fraction));

  return (
    <span className={cn("relative inline-block", className)} aria-hidden="true">
      <Star className={cn(className, "text-muted-foreground/30")} />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${clamped * 100}%` }}
      >
        <Star className={cn(className, "fill-amber-500 text-amber-500")} />
      </span>
    </span>
  );
}

export function AverageRating({
  rating,
  className,
  size = "sm",
}: {
  rating: RatingSummary;
  className?: string;
  size?: "sm" | "md";
}) {
  const iconClass = size === "md" ? "size-4" : "size-3.5";
  const hasRatings = rating.count > 0 && rating.average !== null;
  const label = hasRatings
    ? `${rating.average!.toFixed(1)} out of 5 stars, ${rating.count} ${rating.count === 1 ? "rating" : "ratings"}`
    : "No ratings yet";

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs", className)}
      aria-label={label}
    >
      <span className="inline-flex items-center">
        {Array.from({ length: 5 }, (_, index) => (
          <PartialStar
            key={index}
            className={iconClass}
            fraction={hasRatings ? rating.average! - index : 0}
          />
        ))}
      </span>
      {hasRatings ? (
        <>
          <span className="font-medium text-foreground">
            {rating.average!.toFixed(1)}
          </span>
          <span className="text-muted-foreground">
            ({rating.count} {rating.count === 1 ? "rating" : "ratings"})
          </span>
        </>
      ) : (
        <span className="text-muted-foreground">No ratings yet</span>
      )}
    </span>
  );
}

export function CourseRatingForm({
  userRating,
}: {
  userRating: number | null;
}) {
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();
  const submitted = fetcher.formData?.get("stars");
  const selected =
    typeof submitted === "string" && submitted !== ""
      ? Number(submitted)
      : userRating;
  const isSaving = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (fetcher.data?.success) {
      toast.success("Rating saved.");
    } else if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form method="post" className="space-y-2">
      <input type="hidden" name="intent" value="rate" />
      <div className="text-sm font-medium">
        {selected ? "Your rating" : "Rate this course"}
      </div>
      <div role="group" aria-label="Your star rating" className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const stars = index + 1;
          const isFilled = selected !== null && stars <= selected;
          return (
            <button
              key={stars}
              type="submit"
              name="stars"
              value={stars}
              disabled={isSaving}
              aria-label={`Rate ${stars} ${stars === 1 ? "star" : "stars"}`}
              aria-pressed={selected === stars}
              className="rounded-sm p-0.5 text-amber-500 transition-colors hover:bg-amber-500/10 disabled:opacity-60"
            >
              <Star
                className={cn(
                  "size-6",
                  isFilled
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground/40"
                )}
              />
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {selected
          ? "Click a star to change your rating."
          : "Click a star to rate this course."}
      </p>
    </fetcher.Form>
  );
}
