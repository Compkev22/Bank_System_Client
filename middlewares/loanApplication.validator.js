import { body, param, validationResult } from 'express-validator';

const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
};

export const validateCreateApplication = [
    body('account').isMongoId().withMessage('Cuenta no válida'),
    body('amount').isFloat({ min: 100 }).withMessage('El monto debe ser mínimo 100'),
    body('termMonths').isInt({ min: 1, max: 120 }).withMessage('El plazo debe ser entre 1 y 120 meses'),
    body(['status', 'reviewedBy', 'reviewDate']).custom(v => { if(v) throw new Error('Campos protegidos'); return true; }),
    validateFields
];

export const validateUpdateApplication = [
    param('id').isMongoId(),
    body(['status', 'reviewedBy', 'reviewDate', 'applicant']).custom(v => { if(v) throw new Error('Campos protegidos'); return true; }),
    validateFields
];

export const validateParamId = [ param('id').isMongoId(), validateFields ];