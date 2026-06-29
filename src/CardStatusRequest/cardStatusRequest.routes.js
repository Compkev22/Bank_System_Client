import { Router } from 'express';
import {
    getMyCardStatusRequests,
    createCardStatusRequest,
    cancelCardStatusRequest
} from './cardStatusRequest.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validateCardStatusRequest, validateCardStatusRequestIdParam } from '../../middlewares/cardStatusRequest.validator.js';

const router = Router();

router.use(validateJWT, hasRole('USER_ROLE'));

// GET  /bankSystem/v1/cardStatusRequests
router.get('/', getMyCardStatusRequests);

// POST /bankSystem/v1/cardStatusRequests
router.post('/', validateCardStatusRequest, createCardStatusRequest);

// PATCH /bankSystem/v1/cardStatusRequests/:id/cancel
router.patch('/:id/cancel', validateCardStatusRequestIdParam, cancelCardStatusRequest);

export default router;