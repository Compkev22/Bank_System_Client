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

export const validatePayInstallment = [
    body('extraFinancingId')
        .notEmpty().withMessage('El ID del extra-financiamiento es obligatorio')
        .isMongoId().withMessage('El ID del financiamiento no es válido'),

    body('accountId')
        .notEmpty().withMessage('El ID de la cuenta bancaria de origen es obligatorio')
        .isMongoId().withMessage('El ID de la cuenta bancaria no es válido'),

    validateFields
];