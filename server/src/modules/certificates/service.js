import { certificateCodeSchema, publicCertificateSchema } from '@typeflow/shared';
import { HttpError } from '../../middleware/validate.js';

export function createCertificateService({ database }) {
  return {
    async verify(rawCode) {
      const codeResult = certificateCodeSchema.safeParse(rawCode);
      if (!codeResult.success) {
        throw new HttpError(404, 'NOT_FOUND', 'Certificate was not found');
      }

      const certificate = await database.certificate.findUnique({
        where: { code: codeResult.data },
        include: { user: { select: { name: true } } },
      });
      if (!certificate || certificate.isRevoked) {
        throw new HttpError(404, 'NOT_FOUND', 'Certificate was not found');
      }

      return publicCertificateSchema.parse({
        code: certificate.code,
        name: certificate.user.name || 'TypeFlow learner',
        issueDate: certificate.issuedAt.toISOString().slice(0, 10),
        netWpm: certificate.netWpm,
        rawAccuracy: certificate.accuracy,
      });
    },
  };
}
