import { Router } from 'express';
import { 
    getMyTransactions, 
    getMyAccountHistory, 
    createMyTransaction 
} from './transaction.controller.js';

// Middlewares de seguridad
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';

// Validadores
import { 
    validateGetMyTransactions, 
    validateGetMyAccountHistory, 
    validateCreateMyTransaction 
} from '../../middlewares/transaction.validator.js';

const router = Router();

// Todas las rutas de este submódulo requieren que el usuario esté autenticado y sea CLIENTE
router.use(validateJWT, hasRole('USER'));

/**
 * Obtener todas mis transacciones (paginado)
 * GET /api/client/transactions
 */
router.get('/', validateGetMyTransactions, getMyTransactions);

/**
 * Obtener el historial formateado de ingresos/egresos de una cuenta específica
 * GET /api/client/transactions/account/:id
 */
router.get('/account/:id', validateGetMyAccountHistory, getMyAccountHistory);

/**
 * Crear una nueva transacción (Transferencias, pagos, etc.)
 * POST /api/client/transactions
 */
router.post('/', validateCreateMyTransaction, createMyTransaction);

export default router;