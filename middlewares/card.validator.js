import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const validateCreateCard = [
    body('cardNumber')
        .isLength({ min: 16, max: 16 }).withMessage('El número de tarjeta debe tener 16 dígitos')
        .isNumeric().withMessage('Solo se permiten números'),
    body('holderName')
        .notEmpty().withMessage('El nombre del titular es obligatorio'),
    body('expirationDate')
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('Formato de fecha inválido (MM/YY)'),
    body('cvv')
        .isLength({ min: 3, max: 4 }).isNumeric(),
    body('brand')
        .isIn(['VISA', 'MASTERCARD', 'AMEX']).withMessage('Marca de tarjeta no soportada'),
    body('account')
        .notEmpty().withMessage('El ID de la cuenta es obligatorio')
        .isMongoId().withMessage('No es un ID de cuenta válido'),    
    checkValidators
];

export const validateCardId = [
    param('id').isMongoId().withMessage('ID de tarjeta inválido'),
    checkValidators
];



export const validatePayCreditCard = [
    param('id').isMongoId().withMessage('ID de tarjeta inválido'),
    body('amount')
        .notEmpty().withMessage('El monto es obligatorio')
        .isNumeric().withMessage('El monto debe ser un número')
        .isFloat({ min: 0.01 }).withMessage('El monto a pagar debe ser mayor a 0'),
    body('accountId')
        .notEmpty().withMessage('El ID de la cuenta es obligatorio')
        .isMongoId().withMessage('El ID de la cuenta no es válido'),
    checkValidators
];