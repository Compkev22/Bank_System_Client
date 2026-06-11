import { Router } from 'express';
import { login, register, verifyEmail, registerInternal, verifyInternal } from './auth.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateInternalRequest } from '../../middlewares/internal-auth.js';


const api = Router();

api.post('/register', register);
api.post('/login', login);
api.get('/verify-email', [validateJWT], verifyEmail);

// Ruta interna - solo llamada por el Auth Service .NET
// En producción protegerla con un API key o restringir por IP
api.post('/register-internal', [validateInternalRequest], registerInternal);
api.post('/verify-internal', [validateInternalRequest], verifyInternal);
export default api;