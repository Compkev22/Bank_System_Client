import { Router } from 'express';
import { payLoanInstallment } from './loanPayment.controller.js'; // Asegúrate de que la ruta apunte al archivo correcto

// Middlewares de seguridad
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validatePayLoanInstallment } from '../../middlewares/loanPayment-validator.js';

const router = Router();

// Protegemos la ruta para que solo usuarios autenticados puedan procesar pagos
router.use(validateJWT, hasRole('USER_ROLE'));

/**
 * Procesar el pago de la próxima cuota de un préstamo
 * POST /api/client/loan-payments
 */
router.post('/', validatePayLoanInstallment, payLoanInstallment);

export default router;