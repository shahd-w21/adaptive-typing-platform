/**
 * Course persistence queries. Each published version is read as a stable snapshot;
 * database clients may be transaction-scoped when a caller needs atomic writes.
 */
/**
 * Build course queries over the provided Prisma client or transaction client.
 * @param {object} database Prisma client used by the caller.
 * @returns {object} Published-content, enrollment, and owned-path persistence methods.
 */
export function createCourseRepository(database) {
  return {
    /** List only published or explicitly requested archived snapshots. */
    async listPublished({ search, level, topic, status = 'all' }) {
      const versionWhere = {
        status: status === 'archived' ? 'archived' : 'published',
      };
      if (level && level !== 'all') versionWhere.level = level;
      if (topic && topic !== 'all') versionWhere.topic = topic;
      if (search) {
        versionWhere.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { keyFocus: { contains: search, mode: 'insensitive' } },
        ];
      }
      const where = { versions: { some: versionWhere } };
      if (search) {
        where.OR = [
          { slug: { contains: search, mode: 'insensitive' } },
          { versions: { some: versionWhere } },
        ];
      }
      return database.course.findMany({
        where,
        include: {
          versions: {
            where: versionWhere,
            orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
            take: 1,
          },
        },
        orderBy: { slug: 'asc' },
      });
    },

    /** Resolve a stable course by UUID or public slug without exposing drafts. */
    async findByIdOrSlug(identifier) {
      return database.course.findFirst({
        where: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier)
          ? { id: identifier }
          : { slug: identifier },
        include: {
          versions: {
            where: { status: { in: ['published', 'archived'] } },
            orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          },
        },
      });
    },

    /** Read an enrollment using its retry-safe user/version identity. */
    async findEnrollmentForVersion(userId, courseVersionId) {
      return database.courseEnrollment.findUnique({
        where: { userId_courseVersionId: { userId, courseVersionId } },
        include: { course: true, courseVersion: true },
      });
    },

    /** List only rows owned by the requested authenticated user. */
    async listEnrollments(userId) {
      return database.courseEnrollment.findMany({
        where: { userId },
        include: { course: true, courseVersion: true },
        orderBy: [{ lastActiveAt: 'desc' }, { enrolledAt: 'desc' }],
      });
    },

    /** Return an enrollment only when both the row and user ID match. */
    async findOwnedEnrollment(userId, enrollmentId) {
      return database.courseEnrollment.findFirst({
        where: { id: enrollmentId, userId },
        include: { course: true, courseVersion: true },
      });
    },

    /** Persist a new enrollment and return its captured course snapshot. */
    async createEnrollment(data) {
      return database.courseEnrollment.create({
        data,
        include: { course: true, courseVersion: true },
      });
    },
  };
}
