import { Router } from 'express';
import { login, register, verifyEmail } from './auth.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const api = Router();

api.post('/register', register);
api.post('/login', login);

// activar cuenta
api.get('/verify-email', [ validateJWT ], verifyEmail);

export default api;