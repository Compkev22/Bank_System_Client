import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

//Parte Roberto
export const validateCreateTransaction = [
    body('amount')
        .notEmpty().withMessage('El monto es requerido')
        .isFloat({ min: 0.01 }).withMessage('Monto inválido'),

    body('type')
        .notEmpty().withMessage('El tipo es requerido')
        .isIn([
            'DEPOSIT',
            'CARD_WITHDRAWAL',
            'SERVICE_PAYMENT',
            'LOAN_PAYMENT',
            'TRANSFER'
        ]).withMessage('Tipo de transacción no válido'),

    body('currency')
        .optional()
        .isIn(['GTQ', 'USD', 'EUR', 'MXN'])
        .withMessage('Moneda no válida'),

    body('exchangeRate')
        .optional()
        .isFloat({ min: 0.0001 })
        .withMessage('Tipo de cambio inválido'),
    //Parte Kevin
    body('AccountOriginId')
        .notEmpty().withMessage('El ID de cuenta de origen es requerido')
        .isMongoId().withMessage('Debe ser un ID válido de MongoDB'),

    body('AccountDestinyId')
        .optional()
        .notEmpty().withMessage('El ID de cuenta de destino es requerido')
        .isMongoId().withMessage('Debe ser un ID válido de MongoDB')
        .custom((value, { req }) => {
            if (value === req.body.AccountOriginId) {
                throw new Error('La cuenta de destino no puede ser igual a la de origen');
            }
            return true;
        }),

    checkValidators
];




export const validateHistoryId = [
    param('id')
        .isMongoId().withMessage('El ID de la cuenta proporcionado no es un formato válido de MongoDB.'),
    checkValidators
];