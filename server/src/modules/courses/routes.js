/** Student routes for the published course catalog and owned enrollments. */
import { Router } from 'express';
import {
  courseCatalogQuerySchema,
  enrollCourseRequestSchema,
} from '@typeflow/shared';
import { csrf, createAuthMiddleware, requireRole } from '../../middleware/auth.js';
import { parse } from '../../middleware/validate.js';
import { createCourseService } from './service.js';

/** Mount public catalog reads and authenticated student enrollment operations. */
export function courseRoutes(deps) {
  const router = Router();
  const service = createCourseService(deps);
  const authenticate = createAuthMiddleware(deps);

  router.get('/', async (request, response) => {
    const filters = parse(courseCatalogQuerySchema, request.query);
    response.json(await service.catalog(filters));
  });
  router.get('/my-courses', authenticate, requireRole('STUDENT'), async (request, response) => {
    response.json(await service.myEnrollments(request.user.id));
  });
  router.get('/:courseId', async (request, response) => {
    response.json(await service.detail(request.params.courseId));
  });
  router.post(
    '/:courseId/enrollments',
    authenticate,
    requireRole('STUDENT'),
    csrf(deps.config),
    async (request, response) => {
      const body = parse(enrollCourseRequestSchema, request.body);
      if (body.courseId !== request.params.courseId) {
        return response.status(400).json({ error: { code: 'INVALID_REQUEST' } });
      }
      const result = await service.enroll(request.user.id, request.params.courseId);
      response.status(201).json(result);
    },
  );
  return router;
}
