'use strict';

import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const validateCreateProduct = [
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
    
    body('description')
        .notEmpty().withMessage('La descripción es obligatoria'),
    
    body('price')
        .notEmpty().withMessage('El precio es obligatorio')
        .isFloat({ min: 0 }).withMessage('El precio no puede ser negativo'),
    
    body('type')
        .notEmpty().withMessage('Debe especificar el tipo')
        .isIn(['PRODUCTO', 'SERVICIO']).withMessage('El tipo solo puede ser PRODUCTO o SERVICIO'),
    
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
        
    checkValidators
];

export const validateUpdateProduct = [
    param('id').isMongoId().withMessage('ID de producto no válido'),
    body('name').optional().isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
    body('price').optional().isFloat({ min: 0 }).withMessage('El precio no puede ser negativo'),
    body('type').optional().isIn(['PRODUCTO', 'SERVICIO']).withMessage('El tipo solo puede ser PRODUCTO o SERVICIO'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
    checkValidators
];

export const validateProductId = [
    param('id').isMongoId().withMessage('ID de producto no válido'),
    checkValidators
];