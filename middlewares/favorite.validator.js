'use strict';

import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const validateAddFavorite = [
    body('accountId')
        .notEmpty().withMessage('El ID de la cuenta es obligatorio')
        .isMongoId().withMessage('Debe ser un ID válido de MongoDB'),
    
    body('alias')
        .notEmpty().withMessage('El alias es obligatorio')
        .isString().withMessage('El alias debe ser un texto')
        .isLength({ max: 50 }).withMessage('El alias no puede superar los 50 caracteres'),
        
    checkValidators
];

export const validateRemoveFavorite = [
    param('id')
        .isMongoId().withMessage('El ID del favorito proporcionado no es válido'),
        
    checkValidators
];