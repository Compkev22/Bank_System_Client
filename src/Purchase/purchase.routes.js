import { Router } from 'express';
import { getMyPurchases, processMyPurchase } from './purchase.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validateGetPurchases, validateProcessPurchase } from '../../middlewares/purchase-validator.js';

const router = Router();

// Todas las rutas de compras están protegidas para clientes
router.use(validateJWT, hasRole('USER_ROLE'));

// Obtener compras (Requiere ?cardId= en la query)
router.get('/', validateGetPurchases, getMyPurchases);

// Realizar una compra
router.post('/', validateProcessPurchase, processMyPurchase);

export default router;