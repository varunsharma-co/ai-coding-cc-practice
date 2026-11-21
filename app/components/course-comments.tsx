import { useEffect, useId, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { UserAvatar } from "~/components/user-avatar";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export type CourseCommentView = {
  id: number;
  authorName: string;
  avatarUrl: string | null;
  isInstructor: boolean;
  createdAt: string;
  createdAtLabel: string;
  edited: boolean;
  deleted: boolean;
  body: string | null;
  bodyHtml: string | null;
  canModify: boolean;
  replies: CourseCommentView[];
};

type CommentActionData =
  | { ok: true; error: null }
  | { ok: false; error: string };

export function CourseComments({ comments }: { comments: CourseCommentView[] }) {
  return (
    <section className="mt-10" aria-labelledby="course-comments-heading">
      <h2 id="course-comments-heading" className="mb-4 text-xl font-semibold">
        Comments
      </h2>
      <CommentForm intent="create-comment" submitLabel="Comment" label="Add a comment" />
      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ol className="mt-6 list-none space-y-6 p-0">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentThread comment={comment} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function CommentThread({ comment }: { comment: CourseCommentView }) {
  return (
    <article className="space-y-3">
      <CommentBody comment={comment} />
      {comment.replies.length > 0 && (
        <ol className="list-none space-y-4 border-l p-0 pl-4">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <CommentBody comment={reply} />
            </li>
          ))}
        </ol>
      )}
      <CommentForm
        intent="create-comment"
        parentId={comment.id}
        submitLabel="Reply"
        label="Reply"
        hideLabel
      />
    </article>
  );
}

function CommentBody({ comment }: { comment: CourseCommentView }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-2">
      <CommentHeader comment={comment} />
      {editing && comment.body != null ? (
        <CommentForm
          intent="edit-comment"
          commentId={comment.id}
          initialBody={comment.body}
          submitLabel="Save"
          label="Edit comment"
          hideLabel
          onCancel={() => setEditing(false)}
          onSuccess={() => setEditing(false)}
        />
      ) : comment.deleted ? (
        <p className="text-sm text-muted-foreground italic">
          This comment was deleted.
        </p>
      ) : (
        <div
          className="prose prose-sm prose-neutral dark:prose-invert max-w-none break-words"
          dangerouslySetInnerHTML={{ __html: comment.bodyHtml ?? "" }}
        />
      )}
      {comment.canModify && !editing && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
          <DeleteCommentButton commentId={comment.id} />
        </div>
      )}
    </div>
  );
}

function CommentHeader({ comment }: { comment: CourseCommentView }) {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        name={comment.authorName}
        avatarUrl={comment.avatarUrl}
        className="size-8"
      />
      <div className="min-w-0 text-sm">
        <span className="font-medium">{comment.authorName}</span>
        {comment.isInstructor && (
          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            Instructor
          </span>
        )}
        <time
          dateTime={comment.createdAt}
          className="ml-2 text-muted-foreground"
        >
          {comment.createdAtLabel}
        </time>
        {comment.edited && (
          <span className="ml-2 text-muted-foreground">edited</span>
        )}
      </div>
    </div>
  );
}

function CommentForm({
  intent,
  parentId,
  commentId,
  initialBody = "",
  submitLabel,
  label,
  hideLabel = false,
  onCancel,
  onSuccess,
}: {
  intent: "create-comment" | "edit-comment";
  parentId?: number;
  commentId?: number;
  initialBody?: string;
  submitLabel: string;
  label: string;
  hideLabel?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const fetcher = useFetcher<CommentActionData>();
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();
  const error = fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data?.ok) return;
    if (onSuccess) {
      onSuccess();
      return;
    }
    formRef.current?.reset();
  }, [fetcher.state, fetcher.data, onSuccess]);

  return (
    <fetcher.Form ref={formRef} method="post" className="space-y-2">
      <input type="hidden" name="intent" value={intent} />
      {parentId != null && (
        <input type="hidden" name="parentId" value={parentId} />
      )}
      {commentId != null && (
        <input type="hidden" name="commentId" value={commentId} />
      )}
      <label htmlFor={id} className={hideLabel ? "sr-only" : "text-sm font-medium"}>
        {label}
      </label>
      <Textarea
        id={id}
        name="body"
        defaultValue={initialBody}
        aria-label={hideLabel ? label : undefined}
        aria-invalid={error ? true : undefined}
        rows={3}
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </fetcher.Form>
  );
}

function DeleteCommentButton({ commentId }: { commentId: number }) {
  const fetcher = useFetcher<CommentActionData>();
  const error = fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;

  return (
    <fetcher.Form
      method="post"
      onSubmit={(event) => {
        if (!window.confirm("Delete this comment?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="intent" value="delete-comment" />
      <input type="hidden" name="commentId" value={commentId} />
      <Button type="submit" variant="ghost" size="sm">
        Delete
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fetcher.Form>
  );
}
