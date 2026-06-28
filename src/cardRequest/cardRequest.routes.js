import { Router } from 'express';
import {
    getMyCardRequests,
    getMyCardRequestById,
    createCardRequest,
    cancelCardRequest
} from './cardRequest.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';

const router = Router();

router.use(validateJWT, hasRole('USER_ROLE'));

// GET /client/card-requests
router.get('/', getMyCardRequests);

// GET /client/card-requests/:id
router.get('/:id', getMyCardRequestById);

// POST /client/card-requests
router.post('/', createCardRequest);

// PATCH /client/card-requests/:id/cancel
router.patch('/:id/cancel', cancelCardRequest);

export default router;