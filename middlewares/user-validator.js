import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const validateCreateUser = [
    body('UserName')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requeridoo')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('UserSurname')
        .trim()
        .notEmpty()
        .withMessage('El apellido es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido debe tener entre 2 y 100 caracteres'),

    body('UserDPI')
        .trim()
        .notEmpty()
        .withMessage('El DPI es requerido')
        .isLength({ min: 13, max: 15 })
        .withMessage('El DPI debe tener entre 13 y 15 caracteres')
        .isNumeric()
        .withMessage('El DPI solo debe contener números'),

    body('UserEmail')
        .trim()
        .notEmpty()
        .withMessage('El correo es requerido')
        .isEmail()
        .withMessage('Debe ser un correo electrónico válido'),

    body('UserPassword')
        .notEmpty()
        .withMessage('La contraseña es requerida')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),

    body('UserRol')
        .optional()
        .isIn(['ADMIN', 'USER'])
        .withMessage('Rol no válido'),

    body('UserStatus')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Estado no válido'),

    body('UserAddress')
        .notEmpty().withMessage('La dirección es requerida'),

    body('UserPhone')
        .notEmpty().withMessage('El celular es requerido'),

    body('UserJob')
        .notEmpty().withMessage('El nombre de trabajo es requerido'),

    body('UserIncome')
        .notEmpty().withMessage('Los ingresos mensuales son requeridos')
        .isNumeric().withMessage('Los ingresos deben ser un número')
        .isFloat({ min: 100 }).withMessage('Transacción denegada: Los ingresos mensuales deben ser iguales o mayores a Q100 para abrir una cuenta.'),    
    checkValidators,
];

export const validateUpdateUserRequest = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),

    body('UserName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('UserSurname')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido debe tener entre 2 y 100 caracteres'),

    body('UserDPI')
        .optional()
        .trim()
        .isLength({ min: 13, max: 15 })
        .withMessage('El DPI debe tener entre 13 y 15 caracteres')
        .isNumeric()
        .withMessage('El DPI solo debe contener números'),

    body('UserEmail')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Debe ser un correo electrónico válido'),

    body('UserPassword')
        .optional()
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),

    body('UserRol')
        .optional()
        .isIn(['ADMIN', 'USER'])
        .withMessage('Rol no válido'),

    body('UserStatus')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Estado no válido'),
    
    body('UserAddress')
        .optional()
        .notEmpty().withMessage('La dirección es requerida'),

    body('UserPhone')
        .optional()
        .notEmpty().withMessage('El celular es requerido'),

    body('UserJob')
        .optional()
        .notEmpty().withMessage('El nombre de trabajo es requerido'),

    body('UserIncome')
        .optional()
        .notEmpty().withMessage('Los ingresos mensuales son requeridos')
        .isNumeric().withMessage('Los ingresos deben ser un número')
        .isFloat({ min: 100 }).withMessage('Transacción denegada: Los ingresos mensuales deben ser iguales o mayores a Q100 para abrir una cuenta.'),
    checkValidators,
];

// Validación para activar/desactivar usuario
export const validateUserStatusChange = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetUserById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];
