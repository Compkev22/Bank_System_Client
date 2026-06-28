import { body, param, validationResult } from 'express-validator';

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

export const validateCreateExtraFinancingRequest = [
    body('creditCard')
        .notEmpty().withMessage('El ID de la tarjeta de crédito es obligatorio')
        .isMongoId().withMessage('El ID de la tarjeta debe ser un MongoDB ID válido'),

    body('description')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isString().trim(),

    body('totalAmount')
        .notEmpty().withMessage('El monto total es obligatorio')
        .isFloat({ min: 1 }).withMessage('El monto debe ser mayor a 0'),

    body('installments')
        .notEmpty().withMessage('El número de cuotas es obligatorio')
        .isIn([12, 24, 36, 48]).withMessage('Las cuotas deben ser 12, 24, 36 o 48'),

    validateFields
];

export const validateRejectExtraFinancingRequest = [
    body('rejectionReason')
        .notEmpty().withMessage('El motivo de rechazo es obligatorio')
        .isString().trim(),

    validateFields
];