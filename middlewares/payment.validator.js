import { body } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const validatePayment = [
    body('amount', 'Monto inválido').notEmpty().isNumeric(),
    body('description', 'Descripción muy corta').notEmpty().isLength({ min: 5 }),
    body('account', 'ID de cuenta inválido').notEmpty().isMongoId(),
    checkValidators
];