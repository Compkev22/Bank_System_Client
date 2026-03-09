import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const validateCreateDebt = [
    body('title').notEmpty().withMessage('El título es requerido'),
    
    body('creditorId')
        .optional() 
        .isMongoId().withMessage('Debe ser un ID válido de MongoDB'),
        
    body('totalAmount')
        .isFloat({ min: 0.01 }).withMessage('Monto inválido'),

    body('dueDate')
        .isISO8601().withMessage('Fecha inválida (YYYY-MM-DD)'),

    checkValidators
];

export const validateDebtId = [
    param('id').isMongoId().withMessage('ID de deuda no válido'),
    checkValidators
];

export const validatePayment = [
    param('id').isMongoId(),
    body('amount').isFloat({ min: 0.01 }),
    checkValidators
];