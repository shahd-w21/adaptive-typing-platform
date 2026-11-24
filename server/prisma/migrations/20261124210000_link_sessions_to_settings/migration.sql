-- Preserve the immutable settings version captured by every typing session.
-- Stop with a clear error rather than guessing how orphaned historical rows map.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "TypingSession" AS session
    LEFT JOIN "SettingVersion" AS settings
      ON settings."id" = session."settingsId"
    WHERE settings."id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot link TypingSession.settingsId: orphaned settings versions require an explicit backfill decision';
  END IF;
END $$;

CREATE INDEX "TypingSession_settingsId_idx"
ON "TypingSession"("settingsId");

ALTER TABLE "TypingSession"
ADD CONSTRAINT "TypingSession_settingsId_fkey"
FOREIGN KEY ("settingsId")
REFERENCES "SettingVersion"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
