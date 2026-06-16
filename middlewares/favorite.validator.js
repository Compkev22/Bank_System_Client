import { body, validationResult } from 'express-validator';

// Middleware genérico para retornar errores formateados
const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "error de validacion", // Agregado para hacer match exacto con tu respuesta JSON anterior
            error: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    }
    next();
};

// ==========================================
// VALIDACIONES PARA FAVORITOS (T39)
// ==========================================

export const validateAddFavorite = [
    body('accountNumber')
        .notEmpty().withMessage('El número de cuenta es obligatorio')
        .isString().withMessage('El número de cuenta debe ser una cadena de texto')
        .trim()
        .isLength({ min: 10, max: 10 }).withMessage('El número de cuenta debe tener exactamente 10 dígitos'),

    body('alias')
        .notEmpty().withMessage('El alias para la cuenta favorita es obligatorio')
        .isString().withMessage('El alias debe ser una cadena de texto')
        .trim()
        .isLength({ max: 50 }).withMessage('El alias no puede superar los 50 caracteres'),

    validateFields
];

export const validateRemoveFavorite = [
    // Asumiendo que eliminas usando el ID de la relación Favorito que está en los parámetros de la URL (:id)
    validateFields
];


export const validatePayLoanInstallment = [
    body('loanId')
        .notEmpty().withMessage('El ID del préstamo es obligatorio')
        .isMongoId().withMessage('El ID del préstamo proporcionado no es un formato válido de MongoDB'),

    body('accountId')
        .notEmpty().withMessage('El ID de la cuenta bancaria de origen es obligatorio')
        .isMongoId().withMessage('El ID de la cuenta bancaria proporcionado no es un formato válido de MongoDB'),

    // Seguridad adicional: Bloquear cualquier otro campo que intenten inyectar
    body(['amount', 'status', 'transactionId'])
        .custom((value) => {
            if (value !== undefined) {
                
                throw new Error('No puedes enviar campos transaccionales calculados por el servidor');
            }
            return true;
        }),

    validateFields
];