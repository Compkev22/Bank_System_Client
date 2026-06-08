import { Router } from 'express';
import { getMyProfile, updateMyProfile } from './user.controller.js';

// Middlewares de autenticación y protección
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';

// Tu nuevo validador de perfil
import { validateUpdateProfile } from '../../middlewares/user-validator.js';

const router = Router();

// Todo el submódulo de perfil requiere una sesión activa de CLIENTE
router.use(validateJWT, hasRole('CLIENT_ROLE'));

/**
 * Ver mi propio perfil de usuario
 * GET /api/client/profile
 */
router.get('/', getMyProfile);

/**
 * Actualizar campos permitidos de mi perfil
 * PUT /api/client/profile
 */
router.put('/', validateUpdateProfile, updateMyProfile);

export default router;