import { Router } from 'express';
import { getMyLoanDetails, payMyInstallment } from './LoanDetail.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validateGetDetails, validatePayInstallment } from '../../middlewares/loanDetail-validator.js';

const router = Router();
router.use(validateJWT, hasRole('USER'));

router.get('/:loanId', validateGetDetails, getMyLoanDetails);
router.post('/pay', validatePayInstallment, payMyInstallment);

export default router;