import { Router } from 'express';
import { getMyFinancingDetails } from './extraFinancingDetail.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasRole } from '../../middlewares/role-validator.js';
import { validateGetDetailsParam } from '../../middlewares/extraFinancingDetail-validator.js';

const router = Router();

router.use(validateJWT, hasRole('CLIENT_ROLE'));

// GET /client/extra-financing-details/:financingId
router.get('/:financingId', validateGetDetailsParam, getMyFinancingDetails);

export default router;