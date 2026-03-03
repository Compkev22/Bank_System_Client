import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const validateCreateLoanApplication = [

    body('amount')
        .notEmpty().withMessage('El monto solicitado es requerido')
        .isFloat({ min: 100 }).withMessage('El monto mínimo permitido es 100'),

    body('termMonths')
        .notEmpty().withMessage('El plazo en meses es requerido')
        .isInt({ min: 1, max: 120 })
        .withMessage('El plazo debe estar entre 1 y 120 meses'),
    checkValidators
];

export const validateUpdateLoanApplication = [

    param('id')
        .isMongoId().withMessage('ID de solicitud no válido'),

    body('amount')
        .optional()
        .isFloat({ min: 100 })
        .withMessage('El monto mínimo permitido es 100'),

    body('termMonths')
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage('El plazo debe estar entre 1 y 120 meses'),
    checkValidators
];

export const validateLoanApplicationId = [
    param('id').isMongoId().withMessage('ID de solicitud no válido'),
    checkValidators
];