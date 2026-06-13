import { Router } from 'express';
import { getMyCreditCards, requestCreditCard } from './creditCard.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validateRequestCreditCard } from '../../middlewares/creditCard-validator.js';

const router = Router();

router.use(validateJWT, hasRole('USER'));

// GET /client/credit-cards
router.get('/', getMyCreditCards);

// POST /client/credit-cards
router.post('/', validateRequestCreditCard, requestCreditCard);

export default router;