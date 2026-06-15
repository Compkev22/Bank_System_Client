import { Router } from 'express';
import { payMyFinancingInstallment } from './extraFinancingPaymet.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validatePayInstallment } from '../../middlewares/extraFinancingPayment-validator.js';

const router = Router();

router.use(validateJWT, hasRole('USER_ROLE'));

// POST /client/extra-financing-payments
router.post('/', validatePayInstallment, payMyFinancingInstallment);

export default router;