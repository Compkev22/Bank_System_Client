'use strict';

import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { addFavorite, getMyFavorites, removeFavorite } from './favorite.controller.js';
import { validateAddFavorite, validateRemoveFavorite } from '../../middlewares/favorite.validator.js';

const router = Router();

// Todas las rutas de favoritos requieren estar logueado
router.use(validateJWT);

router.post('/', validateAddFavorite, addFavorite); // Aquí meteremos los validadores de la T39
router.get('/my-favorites', getMyFavorites);
router.delete('/:id', validateRemoveFavorite, removeFavorite);

export default router;