import { Router } from 'express';
import { getMyCards, requestCard, toggleMyCardStatus } from './card.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { uploadCardImage } from '../../middlewares/file-uploader.js';

import { 
    validateRequestCard, 
    validateGetMyCards, 
    validateCardIdParam 
} from '../../middlewares/client-card-validator.js';

const router = Router();

// Aplicar roles y JWT a nivel de ruta global (opcional, si todas las rutas lo usan)
router.use(validateJWT, hasRole('CLIENT_ROLE'));

// 1. Obtener tarjetas con query string validado
router.get('/', validateGetMyCards, getMyCards);

// 2. Solicitar tarjeta (Primero sube el archivo, luego valida el body)
router.post('/', uploadCardImage.single('image'), validateRequestCard, requestCard);

// 3. Cambiar estado validando el parámetro ID de la URL
router.patch('/:id/status', validateCardIdParam, toggleMyCardStatus);

export default router;