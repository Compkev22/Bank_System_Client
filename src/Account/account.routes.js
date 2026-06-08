import { Router } from 'express';
import { getMyAccounts, getMyAccountDetails, openMyAccount } from './account.controller.js';

// Middlewares de seguridad
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';

// Validadores
import { validateGetMyAccountDetails, validateOpenMyAccount } from '../../middlewares/account.validator.js';

const router = Router();

// Todas las rutas requieren autenticación y rol de cliente
router.use(validateJWT, hasRole('CLIENT_ROLE'));

/**
 * Listar mis cuentas
 * GET /api/client/accounts
 */
router.get('/', getMyAccounts);

/**
 * Ver detalle de una de mis cuentas
 * GET /api/client/accounts/:id
 */
router.get('/:id', validateGetMyAccountDetails, getMyAccountDetails);

/**
 * Abrir una nueva cuenta bancaria
 * POST /api/client/accounts
 */
router.post('/', validateOpenMyAccount, openMyAccount);

export default router;