import { Router } from 'express';
import { getActiveProducts, getProductById } from './product.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validateGetProducts, validateGetProductById } from '../../middlewares/product.validator.js';

const router = Router();

// Middlewares de autenticación (Opcional si quieres que el catálogo sea público)
router.use(validateJWT, hasRole('CLIENT_ROLE'));

// Obtener todo el catálogo paginado
router.get('/', validateGetProducts, getActiveProducts);

// Obtener un producto específico
router.get('/:id', validateGetProductById, getProductById);

export default router;