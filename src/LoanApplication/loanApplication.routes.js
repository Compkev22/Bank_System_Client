'use strict';

import { Router } from "express";
import { validateJWT} from "../../middlewares/validate-jwt.js";

import {
    validateCreateLoanApplication,
    validateUpdateLoanApplication,
    validateLoanApplicationId
} from "../../middlewares/loanApplication.validator.js";

import {
    createLoanApplication,
    updateLoanApplication,
    cancelLoanApplication,
} from "./loanApplication.controller.js";

const router = Router();

// Crear solicitud (cliente)
router.post(
    '/',
    validateJWT,
    validateCreateLoanApplication,
    createLoanApplication
);
// Editar solicitud (cliente)
router.put(
    '/:id',
    validateJWT,
    validateLoanApplicationId,
    validateUpdateLoanApplication,
    updateLoanApplication
);
// Cancelar solicitud (cliente)
router.put(
    '/:id/cancel',
    validateJWT,
    validateLoanApplicationId,
    cancelLoanApplication
);



export default router;