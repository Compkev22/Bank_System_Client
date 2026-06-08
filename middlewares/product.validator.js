import { query, param, validationResult } from 'express-validator';

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

export const validateGetProducts = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor a 0'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),

    query('type')
        .optional()
        .isString().withMessage('El tipo debe ser una cadena de texto')
        .trim(),

    validateFields
];

export const validateGetProductById = [
    param('id')
        .isMongoId().withMessage('El ID del producto no tiene un formato válido'),
    
    validateFields
];