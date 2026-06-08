import { body, query, param, validationResult } from 'express-validator';

// Middleware auxiliar para capturar y responder con los errores de validación
const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Validar la solicitud de una nueva tarjeta (POST)
 */
export const validateRequestCard = [
    body('account')
        .notEmpty().withMessage('El ID de la cuenta es obligatorio')
        .isMongoId().withMessage('El ID de la cuenta no tiene un formato válido de MongoDB'),
    
    body('type')
        .notEmpty().withMessage('El tipo de tarjeta es obligatorio')
        .isIn(['DEBIT', 'CREDIT']).withMessage('El tipo de tarjeta debe ser DEBIT o CREDIT'),
    
    // Evitamos que el cliente intente enviar datos que el backend debe autogenerar
    body(['cardNumber', 'cvv', 'expirationDate', 'isApproved', 'isActive'])
        .custom((value, { req }) => {
            if (value !== undefined) {
                throw new Error('No estás autorizado a enviar campos autogenerados por el sistema');
            }
            return true;
        }),
        
    validateFields
];

/**
 * Validar los queries de búsqueda/paginación (GET)
 */
export const validateGetMyCards = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor o igual a 1'),
        
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un entero entre 1 y 100'),
        
    query('isActive')
        .optional()
        .isBoolean().withMessage('El campo isActive debe ser un valor booleano (true o false)'),
        
    validateFields
];

/**
 * Validar que el parámetro ID de la tarjeta sea correcto (PATCH / DELETE)
 */
export const validateCardIdParam = [
    param('id')
        .isMongoId().withMessage('El ID de la tarjeta proporcionado no es válido'),
        
    validateFields
];