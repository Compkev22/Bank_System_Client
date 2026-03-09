'use strict';

import { Router } from 'express';
import {
    getTransactions,
    createTransaction,
    getAccountHistory,
} from '../Transaction/transaction.controller.js';

import { validateJWT } from '../../middlewares/validate-jwt.js';

import {
    validateCreateTransaction,
    validateHistoryId
} from '../../middlewares/transaction.validator.js';

const router = Router();

router.post('/',
    validateJWT,
    validateCreateTransaction,
    createTransaction
);


router.get('/account/:id/history', 
    validateJWT,
    validateHistoryId, 
    getAccountHistory
);

router.get('/', 
    validateJWT, 
    getTransactions
);

export default router;