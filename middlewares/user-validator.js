import { body, validationResult } from 'express-validator';

// Captura y responde con los errores de validación de forma limpia y estructurada
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
 * Validar la actualización del perfil del cliente (PUT /)
 */
export const validateUpdateProfile = [
    body('UserName')
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),

    body('UserSurname')
        .optional()
        .isString().withMessage('El apellido debe ser una cadena de texto')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres'),

    body('UserEmail')
        .optional()
        .isEmail().withMessage('Debe proporcionar un correo electrónico válido')
        .normalizeEmail(),

    body('UserPhone')
        .optional()
        .isNumeric().withMessage('El teléfono solo debe contener números')
        .isLength({ min: 8, max: 15 }).withMessage('El teléfono debe tener un rango válido de caracteres'),

    // 🛑 Bloqueo estricto de campos de infraestructura, rol e identidad
    body(['UserDPI', 'UserPassword', 'UserRol', 'UserStatus', 'isVerified', '_id', 'id'])
        .custom((value) => {
            if (value !== undefined) {
                throw new Error('No tienes permisos para modificar campos críticos de identidad o credenciales en este endpoint');
            }
            return true;
        }),

    validateFields
];