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

export const validateGetMyAccountDetails = [
    param('id')
        .isMongoId().withMessage('El ID de la cuenta no tiene un formato válido'),
    validateFields
];

export const validateOpenMyAccount = [
    body('accountType')
        .optional()
        .isString().withMessage('El tipo de cuenta debe ser texto')
        .isIn(['AHORRO', 'MONETARIA', 'PLANILLAS']).withMessage('Tipo de cuenta no válido'),

    // 🛑 Prevenir inyección de campos protegidos
    body(['balance', 'user', 'accountNumber', 'status', 'accountStatus', '_id'])
        .custom((value) => {
            if (value !== undefined) {
                throw new Error('Petición rechazada: Intentaste enviar campos protegidos o de solo lectura');
            }
            return true;
        }),

    validateFields
];