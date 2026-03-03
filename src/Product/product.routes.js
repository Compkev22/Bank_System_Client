'use strict';

import { Router } from 'express';
import { validateJWT, isAdmin } from '../../middlewares/validate-jwt.js';
import { getProducts, } from './product.controller.js';

const router = Router();
  
// Ruta de lectura: Cualquier usuario logueado puede ver el catálogo
router.get('/', validateJWT, getProducts);



export default router;