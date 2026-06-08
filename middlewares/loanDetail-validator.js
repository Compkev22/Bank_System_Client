import { body, param, validationResult } from 'express-validator';

const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
};

export const validateGetDetails = [
    param('loanId').isMongoId().withMessage('ID de préstamo inválido'),
    validateFields
];

export const validatePayInstallment = [
    body('loanId').isMongoId().withMessage('ID de préstamo inválido'),
    body('accountId').isMongoId().withMessage('ID de cuenta bancaria inválido'),
    validateFields
];