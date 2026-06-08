import { body, query, validationResult } from 'express-validator';

const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    }
    next();
};

/**
 * Validar la ejecución de un pago (POST /pay)
 */
export const validatePayCreditCard = [
    body('creditCardId')
        .notEmpty().withMessage('El ID de la tarjeta de crédito es obligatorio')
        .isMongoId().withMessage('El ID de la tarjeta no es un formato válido'),

    body('accountId')
        .notEmpty().withMessage('El ID de la cuenta bancaria de origen es obligatorio')
        .isMongoId().withMessage('El ID de la cuenta no es un formato válido'),

    body('amount')
        .notEmpty().withMessage('El monto a pagar es obligatorio')
        .isFloat({ min: 0.01 }).withMessage('El monto debe ser un número estrictamente mayor a 0'),

    validateFields
];

/**
 * Validar el filtro por query del historial (GET /payments)
 */
export const validateGetPaymentsQuery = [
    query('creditCardId')
        .optional()
        .isMongoId().withMessage('El filtro creditCardId debe ser un ID válido de MongoDB'),

    validateFields
];