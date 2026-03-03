import { Router } from 'express';
import {   
    getUserById,
    updateUser,

} from './user.controller.js';

import {
    validateUpdateUserRequest,
    validateGetUserById
} from '../../middlewares/user-validator.js';

import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();



// Ambos pueden ver perfiles (El controller valida que el USER solo vea el suyo)
router.get('/:id', validateJWT, validateGetUserById, getUserById);



// Ambos pueden editar (El controller valida que el USER solo se edite a sí mismo)
router.put('/:id', validateJWT, validateUpdateUserRequest, updateUser);



export default router;
