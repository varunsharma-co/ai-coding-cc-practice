---
name: database-migrations
description: Migrations for the disposable database. Use when a task changes the schema, when the seed fails to start, or when existing rows must survive a migration.
---

The database is **disposable**. `data.db` is gitignored and holds only seed data, so a schema change migrates, throws the file away, and reseeds from scratch.

`scripts/seed.ts` belongs in that same change. It defines the starting data and recreates the whole database on each run, so the reseeded rows match the schema you just changed.

## Steps

1. **Edit the schema** — `app/db/schema.ts`. Done when the file contains the tables, columns, and enums this change needs.

2. **Generate the migration** — `npm run db:generate`. This writes a new numbered SQL file into `drizzle/`. Done when you have read that file and it matches the schema edit.

3. **Update `scripts/seed.ts`** for every table you touched:
   - **New table** — add a `DROP TABLE IF EXISTS` line to the drop block at the top of `seed()`, above the tables it has foreign keys into (children drop first), and insert rows for it.
   - **New non-nullable column** — give it a value in every `.values({ ... })` call for that table.
   - **Renamed or removed column** — rename or remove it at every insert site for that table.
   - **New enum** — import it from `../app/db/schema` and use its members at the insert sites, matching how `UserRole` and `CourseStatus` are used.

   Done when every table changed in step 1 is accounted for here.

4. **Reseed** — `npm run db:seed`. It drops every table, replays the migrations in `drizzle/`, and reinserts. Done when it prints a summary of row counts.

5. **Typecheck** — `npm run typecheck`. Done when it passes.

## When the seed fails to start

A half-applied migration can leave `data.db` in a state the seed cannot drop its way out of. Delete it and reseed:

```bash
rm -f data.db data.db-shm data.db-wal
npm run db:seed
```

The file is rebuilt from `drizzle/` and `scripts/seed.ts`.

## Keeping existing rows

`npm run db:migrate` applies pending migrations to the existing `data.db` and keeps the rows already in it. The seed applies pending migrations before it inserts. Reach for `npm run db:migrate` when a migration should land on those existing rows.
