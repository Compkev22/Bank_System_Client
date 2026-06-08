'use strict';
import jwt from 'jsonwebtoken';
import User from '../src/User/user.model.js';

// validate-jwt.js
export const validateJWT = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'No hay token' });

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // 1. Extraer el rol (manejando el formato de .NET con SQL)
        // Buscamos en 'role' o en el claim estándar de Microsoft
        let roleFromToken = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        // 2. Si el usuario tiene varios roles (vía user_roles), .NET manda un Array.
        // Nos aseguramos de tomar el que necesitamos o normalizarlo.
        if (Array.isArray(roleFromToken)) {
            roleFromToken = roleFromToken[0]; // Tomamos el primer rol para simplificar
        }

        req.user = {
            id: decoded.sub || decoded.uid,
            role: roleFromToken // Ahora sí será "ADMIN_ROLE"
        };

        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ message: 'Token inválido' });
    }
};