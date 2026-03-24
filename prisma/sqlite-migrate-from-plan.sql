-- Run once if upgrading from a DB that still had Plan + User without startDate.
-- Backup dev.db first.

ALTER TABLE "User" ADD COLUMN "startDate" DATETIME;

UPDATE "User" SET "startDate" = (
  SELECT "startDate" FROM "Plan" WHERE "Plan"."userId" = "User"."id"
) WHERE EXISTS (
  SELECT 1 FROM "Plan" WHERE "Plan"."userId" = "User"."id"
);

DROP TABLE IF EXISTS "Plan";
