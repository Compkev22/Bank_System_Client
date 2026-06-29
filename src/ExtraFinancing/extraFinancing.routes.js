'use strict';
import { Router } from 'express';
import { getMyFinancings, getMyFinancingsByCard } from './extraFinancing.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';

const router = Router();

router.use(validateJWT, hasRole('USER_ROLE'));

// GET /bankSystem/v1/extraFinancings
router.get('/', getMyFinancings);

// GET /bankSystem/v1/extraFinancings/card/:creditCardId
router.get('/card/:creditCardId', getMyFinancingsByCard);

export default router;