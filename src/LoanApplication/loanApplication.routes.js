import { Router } from 'express';
import { getMyLoanApplications, createLoanApplication, updateLoanApplication, cancelLoanApplication } from './loanApplication.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validateCreateApplication, validateUpdateApplication, validateParamId } from '../../middlewares/loanApplication.validator.js';

const router = Router();
router.use(validateJWT, hasRole('CLIENT_ROLE'));

router.get('/', getMyLoanApplications);
router.post('/', validateCreateApplication, createLoanApplication);
router.put('/:id', validateUpdateApplication, updateLoanApplication);
router.patch('/:id/cancel', validateParamId, cancelLoanApplication);

export default router;