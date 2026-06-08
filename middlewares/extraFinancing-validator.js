import { body, validationResult } from 'express-validator';

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

export const validateRequestExtraFinancing = [
    body('creditCard')
        .notEmpty().withMessage('El ID de la tarjeta de crédito es obligatorio')
        .isMongoId().withMessage('El ID de la tarjeta debe ser un formato válido de MongoDB'),

    body('totalAmount')
        .notEmpty().withMessage('El monto total del extra-financiamiento es obligatorio')
        .isFloat({ min: 1 }).withMessage('El monto total debe ser un número positivo mayor a 0'),

    body('installments')
        .notEmpty().withMessage('El número de cuotas es obligatorio')
        .isInt({ min: 1, max: 72 }).withMessage('Las cuotas deben ser un número entero entre 1 y 72'),

    body('description')
        .optional()
        .isString().withMessage('La descripción debe ser un texto válido')
        .trim(),

    // Bloquear campos calculados automáticamente por el backend
    body(['user', 'remainingBalance', 'monthlyPayment', 'interestRate', 'status'])
        .custom((value) => {
            if (value !== undefined) throw new Error('No estás autorizado a enviar campos autogenerados');
            return true;
        }),

    validateFields
];