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

export const validateCardStatusRequest = [
    body('cardId')
        .notEmpty().withMessage('El ID de la tarjeta es obligatorio')
        .isMongoId().withMessage('El ID de la tarjeta no tiene un formato válido'),

    body('cardType')
        .optional()
        .isIn(['DEBIT', 'CREDIT']).withMessage('El tipo de tarjeta debe ser DEBIT o CREDIT'),

    body('requestedStatus')
        .notEmpty().withMessage('El estado solicitado es obligatorio')
        .isIn(['ACTIVATE', 'DEACTIVATE']).withMessage('El estado debe ser ACTIVATE o DEACTIVATE'),

    body('reason')
        .optional()
        .isString().withMessage('El motivo debe ser texto')
        .isLength({ max: 300 }).withMessage('El motivo no puede superar los 300 caracteres'),

    validateFields
];

export const validateCardStatusRequestIdParam = [
    param('id')
        .isMongoId().withMessage('El ID de la solicitud no es válido'),

    validateFields
];