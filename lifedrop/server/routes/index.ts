import { Router } from 'express';
import { asyncHandler } from '../middleware/errors';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { adminLimiter, contactLimiter, requestLimiter } from '../middleware/rateLimits';
import { createRequest } from '../controllers/requests.controller';
import { submitContact } from '../controllers/contact.controller';
import * as admin from '../controllers/admin.controller';

const router = Router();
const h = asyncHandler;

router.get('/health', (_req, res) => res.json({ ok: true }));

router.post('/contact', contactLimiter, h(submitContact));
router.post('/requests', requestLimiter, requireAuth, h(createRequest));

const a = Router();
a.use(adminLimiter, requireAuth, requireAdmin);
a.get('/stats', h(admin.stats));
a.get('/reports', h(admin.reports));
a.get('/users', h(admin.listUsers));
a.patch('/users/:id/suspend', h(admin.setSuspended));
a.get('/donors', h(admin.listDonors));
a.patch('/donors/:id', h(admin.updateDonor));
a.get('/requests', h(admin.listRequests));
a.patch('/requests/:id', h(admin.updateRequestStatus));
a.get('/messages', h(admin.listMessages));
a.patch('/messages/:id', h(admin.updateMessage));
router.use('/admin', a);

export default router;
