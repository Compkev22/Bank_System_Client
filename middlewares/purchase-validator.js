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

export const validateGetPurchases = [
    query('cardId')
        .notEmpty().withMessage('El parámetro cardId es obligatorio en la URL')
        .isMongoId().withMessage('El cardId proporcionado no es válido'),
    validateFields
];

export const validateProcessPurchase = [
    body('description')
        .notEmpty().withMessage('La descripción de la compra es obligatoria')
        .isString().withMessage('La descripción debe ser texto')
        .isLength({ max: 100 }).withMessage('La descripción no puede exceder los 100 caracteres'),

    body('amount')
        .notEmpty().withMessage('El monto es obligatorio')
        .isFloat({ min: 0.01 }).withMessage('El monto debe ser un número positivo mayor a 0'),

    body('type')
        .notEmpty().withMessage('El tipo de transacción es obligatorio')
        .isIn(['CREDIT', 'DEBIT']).withMessage('El tipo debe ser estrictamente CREDIT o DEBIT'),

    body('cardId')
        .notEmpty().withMessage('El ID del método de pago (cardId) es obligatorio')
        .isMongoId().withMessage('El formato del cardId no es válido'),

    // Prevenir inyección de campos protegidos
    body(['status', 'createdAt', '_id']).custom(v => {
        if(v) throw new Error('No puedes enviar campos protegidos en el body'); 
        return true; 
    }),

    validateFields
];