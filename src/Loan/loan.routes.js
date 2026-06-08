import { Router } from 'express';
import { getMyLoans, getMyLoanById } from './loan.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validateGetMyLoanById } from '../../middlewares/loan-validator.js';

const router = Router();
router.use(validateJWT, hasRole('CLIENT_ROLE'));

router.get('/', getMyLoans);
router.get('/:id', validateGetMyLoanById, getMyLoanById);

export default router;  