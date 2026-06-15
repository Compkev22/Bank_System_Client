import { Router } from 'express';
import { getMyFinancings, requestExtraFinancing } from './extraFinancing.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validateRequestExtraFinancing } from '../../middlewares/extraFinancing-validator.js';

const router = Router();

router.use(validateJWT, hasRole('USER_ROLE'));

// GET /client/extra-financings
router.get('/', getMyFinancings);

// POST /client/extra-financings
router.post('/', validateRequestExtraFinancing, requestExtraFinancing);

export default router;