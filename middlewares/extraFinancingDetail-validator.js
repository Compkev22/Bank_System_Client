import { param, validationResult } from 'express-validator';

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

export const validateGetDetailsParam = [
    param('financingId')
        .notEmpty().withMessage('El ID del financiamiento es requerido en la URL')
        .isMongoId().withMessage('El ID proporcionado no es un formato válido de MongoDB'),

    validateFields
];