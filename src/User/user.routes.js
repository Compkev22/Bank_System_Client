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



router.get('/:id', validateJWT, validateGetUserById, getUserById);


router.put('/:id', validateJWT, validateUpdateUserRequest, updateUser);



export default router;
