import { Router } from 'express';
import { payCreditCard, getMyCreditCardPayments } from './creditCardPayment.controller.js'; // O desde tu payment.controller.js si lo separaste
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validatePayCreditCard, validateGetPaymentsQuery } from '../../middlewares/creditCardPayment.validator.js';

const router = Router();

router.use(validateJWT, hasRole('USER'));

// POST /client/credit-cards/pay
router.post('/pay', validatePayCreditCard, payCreditCard);

// GET /client/credit-cards/payments
router.get('/payments', validateGetPaymentsQuery, getMyCreditCardPayments);

export default router;