'use strict';
import jwt from 'jsonwebtoken';
import User from '../src/User/user.model.js';

export const validateJWT = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'No hay token' });

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Buscar usuario en MongoDB por email del token
        const dbUser = await User.findOne({ UserEmail: decoded.email });
        if (!dbUser) return res.status(401).json({ message: 'Usuario no encontrado' });

        // Extraer el rol
        let roleFromToken = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        if (Array.isArray(roleFromToken)) {
            roleFromToken = roleFromToken[0];
        }

        req.user = {
            id: dbUser._id,  // ← ObjectId real de MongoDB
            role: roleFromToken
        };

        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ message: 'Token inválido' });
    }
};