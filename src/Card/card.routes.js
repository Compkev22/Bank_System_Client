import { Router } from 'express';
import { 
    createCard, 
} from './card.controller.js';

import { 
    validateCreateCard, 
    validateCardId 
} from '../../middlewares/card.validator.js';

import { uploadCardImage } from '../../middlewares/file-uploader.js'; 
// Importamos los protectores
import { validateJWT, hasRole, isAdmin } from "../../middlewares/validate-jwt.js";

const router = Router();


// 2. Crear tarjeta (Cualquiera logueado, pero el controlador valida si es su cuenta o si es Admin)
router.post(
    '/',
    validateJWT,
    uploadCardImage.single('image'), 
    validateCreateCard,
    createCard
);







export default router;