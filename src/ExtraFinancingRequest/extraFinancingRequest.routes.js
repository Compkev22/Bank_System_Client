'use strict';
import { Router } from 'express';
import {
    getMyExtraFinancingRequests,
    createExtraFinancingRequest,
    cancelExtraFinancingRequest,
} from './extraFinancingRequest.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validateCreateExtraFinancingRequest, validateRejectExtraFinancingRequest } from '../../middlewares/extraFinancingRequest.validator.js';

const router = Router();

// ── Rutas de cliente ──────────────────────────────────────────────────────────
router.get('/', [validateJWT, hasRole('USER_ROLE')], getMyExtraFinancingRequests);
router.post('/', [validateJWT, hasRole('USER_ROLE'), validateCreateExtraFinancingRequest], createExtraFinancingRequest);
router.patch('/:id/cancel', [validateJWT, hasRole('USER_ROLE')], cancelExtraFinancingRequest);

export default router;