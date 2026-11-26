-- Add versioned course snapshots and user-owned enrollments without changing
-- existing accounts, learning evidence, or session history.
CREATE TABLE "Course" (
  "id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseVersion" (
  "id" UUID NOT NULL,
  "courseId" UUID NOT NULL,
  "versionLabel" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "level" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "estimatedHours" DOUBLE PRECISION NOT NULL,
  "keyFocus" TEXT NOT NULL,
  "prerequisites" JSONB NOT NULL,
  "objectives" JSONB NOT NULL,
  "units" JSONB NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CourseVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseEnrollment" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "courseId" UUID NOT NULL,
  "courseVersionId" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "completedLessonIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE UNIQUE INDEX "CourseVersion_courseId_versionLabel_key"
  ON "CourseVersion"("courseId", "versionLabel");
CREATE INDEX "CourseVersion_status_publishedAt_idx"
  ON "CourseVersion"("status", "publishedAt");
CREATE INDEX "CourseVersion_courseId_status_idx"
  ON "CourseVersion"("courseId", "status");
CREATE UNIQUE INDEX "CourseEnrollment_userId_courseVersionId_key"
  ON "CourseEnrollment"("userId", "courseVersionId");
CREATE INDEX "CourseEnrollment_userId_enrolledAt_idx"
  ON "CourseEnrollment"("userId", "enrolledAt");
CREATE INDEX "CourseEnrollment_courseId_courseVersionId_idx"
  ON "CourseEnrollment"("courseId", "courseVersionId");

ALTER TABLE "CourseVersion"
  ADD CONSTRAINT "CourseVersion_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseEnrollment"
  ADD CONSTRAINT "CourseEnrollment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CourseEnrollment_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "CourseEnrollment_courseVersionId_fkey"
  FOREIGN KEY ("courseVersionId") REFERENCES "CourseVersion"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
