
import { body } from "express-validator";
import { checkValidators } from "./check-validators.js";

export const validateCreateAccount = [
    body('accountNumber')
        .notEmpty().withMessage('El número de cuenta es requerido')
        .isLength({ min: 10, max: 10 }).withMessage('El número de cuenta debe tener 10 dígitos'),
    
    body('accountType')
        .notEmpty().withMessage('El tipo de cuenta es requerido')
        .isIn(['AHORRO', 'MONETARIA']).withMessage('Tipo de cuenta no válida'),
    
    body('balance')
        .optional()
        .isFloat({ min: 0 }).withMessage('El saldo inicial debe ser mayor o igual a 0'),
    
    body('user')
        .notEmpty().withMessage('El ID del usuario es requerido')
        .isMongoId().withMessage('ID de usuario no válido'),

    body('bank')
        .optional() 
        .isIn(['Banco Kinal', 'Banco Industrial', 'Banrural', 'BAC', 'G&T Continental', 'Promerica'])
        .withMessage('El banco ingresado no está en la red autorizada'),
    checkValidators
];