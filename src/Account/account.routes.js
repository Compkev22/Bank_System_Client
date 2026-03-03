import { Router } from "express";
import { validateCreateAccount } from "../../middlewares/account.validator.js"; 
import { 
    getAccounts, 
} from "./account.controller.js";
import { validateJWT} from "../../middlewares/validate-jwt.js";

const router = Router();


router.get('/', validateJWT, getAccounts);

export default router;