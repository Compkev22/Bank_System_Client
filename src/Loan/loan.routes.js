'use strict';

import { Router } from 'express';

// IMPORTACIÓN CORREGIDA
import { validateJWT, hasRole } from '../../middlewares/validate-jwt.js';

import {
    getMyLoans,
    getLoanById
} from './loan.controller.js';

const router = Router();


router.get('/my-loans',
    validateJWT,
    hasRole('USER'),
    getMyLoans
);

router.get('/:id',
    validateJWT,
    getLoanById
);

export default router;