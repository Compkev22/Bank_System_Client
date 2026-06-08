import { param, validationResult } from 'express-validator';

const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
};

export const validateGetMyLoanById = [
    param('id').isMongoId().withMessage('El ID del préstamo no es válido'),
    validateFields
];