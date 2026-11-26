-- Add versionable per-key review scheduling and make existing mastered keys due in one day.
ALTER TABLE "KeyStat"
  ADD COLUMN "reviewStage" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastReviewAt" TIMESTAMPTZ,
  ADD COLUMN "nextReviewAt" TIMESTAMPTZ;

UPDATE "KeyStat"
SET "nextReviewAt" = "updatedAt" + INTERVAL '1 day'
WHERE "status" = 'mastered';

CREATE INDEX "KeyStat_userId_status_nextReviewAt_idx"
ON "KeyStat"("userId", "status", "nextReviewAt");
