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

export const validateRequestCreditCard = [
    body('account')
        .optional()
        .isMongoId().withMessage('El ID de la cuenta asociada debe ser un formato válido de MongoDB'),
    
    body('type')
        .notEmpty().withMessage('El tipo de tarjeta es obligatorio')
        .isIn(['CLASSIC', 'GOLD', 'PLATINUM', 'BLACK']).withMessage('Tipo no válido (CLASSIC, GOLD, PLATINUM, BLACK)'),
    
    body('creditLimit')
        .notEmpty().withMessage('El límite de crédito solicitado es obligatorio')
        .isFloat({ min: 100 }).withMessage('El límite de crédito debe ser un número positivo (mínimo 100)'),

    body(['cardNumber', 'user', 'totalDebt', 'availableCredit', 'cutoffDate', 'paymentDeadline', 'interestRate', 'status'])
        .custom((value) => {
            if (value !== undefined) throw new Error('No puedes enviar campos protegidos o autogenerados');
            return true;
        }),

    validateFields
];