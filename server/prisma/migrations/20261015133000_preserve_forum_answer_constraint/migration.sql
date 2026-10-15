-- Preserve the teammate's one-accepted-answer-per-thread invariant.
CREATE UNIQUE INDEX "ForumPost_one_accepted_per_thread"
ON "ForumPost" ("threadId") WHERE "isAccepted";
