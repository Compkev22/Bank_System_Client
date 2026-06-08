import { body, query, param, validationResult } from 'express-validator';

// Middleware genérico para capturar y formatear errores
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

export const validateGetMyTransactions = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor a 0'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),

    query('type')
        .optional()
        .isString().withMessage('El tipo debe ser texto')
        .trim()
        .toUpperCase(),

    validateFields
];

export const validateGetMyAccountHistory = [
    param('id')
        .isMongoId().withMessage('El ID de la cuenta no tiene un formato válido'),
    
    validateFields
];

export const validateCreateMyTransaction = [
    body('type')
        .notEmpty().withMessage('El tipo de transacción es obligatorio')
        .isIn(['TRANSFER', 'WITHDRAWAL', 'SERVICE_PAYMENT', 'CREDIT_CARD_PAYMENT', 'CARD_CHARGE', 'LOAN_PAYMENT'])
        .withMessage('Tipo de transacción no permitido para clientes'),

    body('amount')
        .notEmpty().withMessage('El monto es obligatorio')
        .isFloat({ min: 0.01 }).withMessage('El monto debe ser un número positivo mayor a 0'),

    body('currency')
        .optional()
        .isString()
        .isLength({ min: 3, max: 3 }).withMessage('La moneda debe tener 3 caracteres (Ej: GTQ, USD)'),

    body('AccountOriginId')
        .notEmpty().withMessage('El ID de la cuenta origen es obligatorio')
        .isMongoId().withMessage('El ID de la cuenta origen no es válido'),

    body('AccountDestinyId')
        .optional()
        .isMongoId().withMessage('El ID de la cuenta destino no es válido'),

    body('card')
        .optional()
        .isMongoId().withMessage('El ID de la tarjeta no es válido'),

    body('loan')
        .optional()
        .isMongoId().withMessage('El ID del préstamo no es válido'),

    body('description')
        .optional()
        .isString().withMessage('La descripción debe ser texto')
        .isLength({ max: 255 }).withMessage('La descripción no puede exceder los 255 caracteres'),

    // Prevenir inyección de campos de auditoría o estado
    body(['status', 'createdAt', 'updatedAt']).custom(v => {
        if(v) throw new Error('No puedes enviar campos protegidos en el body'); 
        return true; 
    }),

    validateFields
];