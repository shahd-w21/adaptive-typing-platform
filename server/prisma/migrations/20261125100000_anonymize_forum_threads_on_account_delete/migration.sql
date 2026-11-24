-- Preserve contributed discussions without retaining the deleted author's identity or text.
ALTER TABLE "ForumThread"
  ALTER COLUMN "userId" DROP NOT NULL,
  ALTER COLUMN "title" DROP NOT NULL;

ALTER TABLE "ForumThread"
  DROP CONSTRAINT "ForumThread_userId_fkey",
  ADD CONSTRAINT "ForumThread_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "User"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
