'use strict';
import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { convertAmount } from './exchange.controller.js';

const router = Router();

router.post('/convert', validateJWT, convertAmount);

export default router;