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