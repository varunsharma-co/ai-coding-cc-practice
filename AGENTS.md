# AGENTS.md

This file guides coding agents working in this repository.

## Overview

Cadence is a full-stack course platform (a mini Udemy) and the exercise repo for the AI Coding Crash Course. Instructors publish courses made of modules and lessons. Students enrol, watch videos, track progress, and take quizzes. Purchasing-power parity, coupons, and team seats cover the commerce side. Star ratings and course comments live in `ratingService` and `courseCommentService`.

## Development Commands

| Command                  | What it does                                                    |
| ------------------------ | --------------------------------------------------------------- |
| `npm run dev`            | Dev server at http://localhost:5173                             |
| `npm run build`          | Production build via `react-router build`                       |
| `npm start`              | Serve the production build                                      |
| `npm run typecheck`      | `react-router typegen` then `tsc`                               |
| `npm test`               | Vitest, single run                                              |
| `npm run test:watch`     | Vitest in watch mode                                            |
| `npm run db:generate`    | Generate a Drizzle migration from `app/db/schema.ts`            |
| `npm run db:migrate`     | Apply pending migrations to `data.db`                           |
| `npm run db:seed`        | Drop, migrate, and reseed the database from `scripts/seed.ts`   |
| `npm run request-logger` | Proxy that logs every request a coding agent sends to the model |
| `npm run loc`            | Line count across tracked source files                          |

Run a single test file:

```bash
npx vitest run app/services/courseService.test.ts
```

Run a single test by name:

```bash
npx vitest run app/services/courseService.test.ts -t "creates a course with draft status"
```

`npm run typecheck` runs `react-router typegen` first, which regenerates the per-route type modules under `.react-router/types`. Running `tsc` on its own reports missing `./+types/*` imports.

Formatting is Prettier, configured in `.prettierrc` (2 spaces, double quotes, semicolons, 80 columns, ES5 trailing commas). There is no ESLint setup and no lint script.

## Tech Stack

- **React Router 8** in framework mode with SSR enabled (`react-router.config.ts`)
- **TypeScript** with `~/*` aliased to `app/*`
- **SQLite** via `better-sqlite3`, accessed through **Drizzle ORM**
- **Tailwind CSS 4** with **shadcn/ui** (new-york style, neutral base, lucide icons)
- **Vitest** for tests, **Zod** for validation, **marked** + **shiki** for markdown
- **Monaco** for the instructor's markdown editor, **@hello-pangea/dnd** for drag-and-drop ordering

## Directory Structure

```
app/
  routes.ts          Route table (config-based routing)
  root.tsx           Root layout, error boundary
  routes/            Route modules — loaders, actions, components
  services/          Data access layer, one module per domain concept
  components/        Shared components; components/ui is shadcn
  lib/               Cross-cutting helpers (session, validation, ppp, markdown)
  db/                Drizzle schema and connection
  test/setup.ts      In-memory test database helpers
drizzle/             Generated SQL migrations and snapshots
scripts/seed.ts      Seed data
request-logger/      Standalone model-request logging proxy
.agents/skills/      Repo skills (.claude/skills symlinks here)
```

## Architecture

### Layering

Requests flow **route → service → Drizzle**. Route modules own HTTP concerns — loaders, actions, redirects, status codes — and rendering. Services own data access and export plain synchronous functions that use the shared `db` instance directly. Services do not receive a database handle as an argument; tests substitute one by mocking the `~/db` module.

Services use positional parameters rather than options objects. Comment headers in `app/services` state this convention.

### Routing

`app/routes.ts` is the route table. Routing is config-based, not file-based, so adding a page means creating the module in `app/routes/` **and** registering it in `app/routes.ts`. Most pages sit inside the `routes/layout.app.tsx` layout. Route modules import their generated types from `./+types/<route-file-name>`.

Route files are named with dots for path segments and `$` for params, for example `courses.$slug.lessons.$lessonId.tsx`.

### Database Access

`app/db/index.ts` exports `db`, a Proxy wrapping a lazily-created Drizzle instance. The connection opens on first property access rather than at module scope, which keeps the module free of side effects so Rollup can tree-shake `better-sqlite3` out of the client bundle when a route imports a service purely for its loader. Keep this file side-effect free.

`app/db/schema.ts` defines the tables and enums:

- **Identity** — `users` (with `UserRole`), `teams`, `teamMembers` (with `TeamMemberRole`)
- **Catalogue** — `categories`, `courses` (with `CourseStatus`), `modules`, `lessons`
- **Learning** — `enrollments`, `lessonProgress` (with `LessonProgressStatus`), `videoWatchEvents`
- **Assessment** — `quizzes`, `quizQuestions` (with `QuestionType`), `quizOptions`, `quizAttempts`, `quizAnswers`
- **Commerce** — `purchases`, `coupons`

`ratingService` and `courseCommentService` import `courseRatings` and `courseComments` from this schema. The SQL for those tables is in `drizzle/0003_course_ratings.sql` and `drizzle/0005_flat_sally_floyd.sql`. Those exports are not in `app/db/schema.ts` today, so those services do not typecheck until the schema exports match the migrations.

Schema changes follow the `database-migrations` skill in `.agents/skills/`: edit the schema, `npm run db:generate`, update `scripts/seed.ts` for every table touched, then `npm run db:seed`. `data.db` is gitignored and disposable — delete it and reseed whenever it gets into a bad state. Read the skill before changing the schema.

### Authentication

There is no password authentication. `app/lib/session.ts` wraps a cookie session (`cadence_session`) that stores a `userId` and an optional `devCountry` override. `app/components/dev-ui.tsx` renders a floating panel that switches the current user and country, posting to `app/routes/api.switch-user.ts` and `app/routes/api.set-dev-country.ts`.

Routes call `getCurrentUserId` themselves. A 401 whose message mentions the DevUI panel means the session has no user selected. A loader guard does not protect the action on the same route, so mutating actions check the session themselves.

### Purchasing Power Parity

`app/lib/ppp.ts` maps countries to four discount tiers (0%, 30%, 50%, 70%) and exposes `checkPppAccess`. A discounted purchase is blocked when the viewer is in a different country. Full-price (tier 1) purchases, free courses, and courses with PPP disabled are not restricted. Unknown countries are tier 1.

`app/lib/country.server.ts` resolves the viewer's country in three layers: the dev session override, the `CF-IPCountry` header, then an ip-api.com lookup, falling back to `null` (treated as tier 1).

### Validation

`app/lib/validation.ts` holds three Zod helpers used by route actions and loaders:

- `parseFormData(formData, schema)` — returns `{ success, data }` or `{ success: false, errors }`, a map of the first error per field, for rendering inline form errors
- `parseJsonBody(request, schema)` — the same shape for JSON endpoints
- `parseParams(params, schema)` — throws a 400 response, since a malformed URL param is not a user-correctable form error

### Markdown Rendering

Two renderers exist deliberately, and they are not interchangeable:

- `app/lib/markdown.server.ts` — `renderMarkdown`, for lesson content and sales copy. Instructor-authored, trusted. Code blocks are highlighted with Shiki. Raw HTML passes through `marked`.
- `app/lib/commentMarkdown.server.ts` — `renderCommentMarkdown`, for student comments. Escapes raw HTML and images as the characters the author typed. Headings, tables, and horizontal rules are shown the same way. Links are limited to `http:` and `https:` (`target="_blank"` and `rel="noopener noreferrer"`).

Both feed `dangerouslySetInnerHTML`, so changes to the comment renderer are security-sensitive.

### Testing

`app/test/setup.ts` exports `createTestDb`, which builds a fresh in-memory SQLite database and applies the real migrations from `drizzle/`, keeping test and production schemas in sync. `seedBaseData` inserts a student, an instructor, a category, and a published course for tests to build on.

Because services import the shared `db` singleton, tests mock the module with a getter so the binding stays live across `beforeEach`, and import the module under test **after** the mock:

```ts
let testDb: ReturnType<typeof createTestDb>;

vi.mock("~/db", () => ({
  get db() {
    return testDb;
  },
}));

import { getCourseById } from "./courseService";

beforeEach(() => {
  testDb = createTestDb();
});
```

Moving that import above the mock makes the service capture the real database silently. Vitest runs with `globals: true` and `vite-tsconfig-paths`, so `describe`/`it`/`expect` need no import and `~/*` resolves in tests.

## Course Repo Workflow

This repo is the exercise project for a course. `main` is the student starting point, and lesson checkpoints live as commits on the `live-run-through` branch, each prefixed with a slug. Three `ai-hero-cli` wrappers drive it:

- `npm run reset <slug>` — hard-reset to a lesson checkpoint
- `npm run cherry-pick <slug>` — apply one lesson's commit onto current work
- `npm run pull` — pull upstream `main` updates into the working branch

These slugs are a public interface consumed by the CLI and referenced in recorded video, so renaming one breaks student navigation.

## Conventions

- Service and lib modules open with a `// ─── Name ───` comment header summarising the module's responsibility. Read those headers before changing a module.
- Enums are TypeScript `enum`s exported from `app/db/schema.ts` and used at every insert site, including `scripts/seed.ts`.
- Server-only modules use the `.server.ts` suffix.
- `cn` in `app/lib/utils.ts` merges Tailwind classes. `formatPrice` treats `0` as "Free" and otherwise formats cents as dollars.
- `data.db` is disposable and gitignored. `scripts/seed.ts` is the source of truth for starting data.
