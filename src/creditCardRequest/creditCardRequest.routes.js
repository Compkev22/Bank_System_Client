import { Router } from 'express';
import {
    getMyCreditCardRequests,
    getMyCreditCardRequestById,
    createCreditCardRequest,
    cancelCreditCardRequest
} from './creditCardRequest.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';

const router = Router();

router.use(validateJWT, hasRole('USER_ROLE'));

// GET /client/credit-card-requests
router.get('/', getMyCreditCardRequests);

// GET /client/credit-card-requests/:id
router.get('/:id', getMyCreditCardRequestById);

// POST /client/credit-card-requests
router.post('/', createCreditCardRequest);

// PATCH /client/credit-card-requests/:id/cancel
router.patch('/:id/cancel', cancelCreditCardRequest);

export default router;