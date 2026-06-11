import User from '../User/user.model.js';
import { generateJWT } from '../../helpers/generate-jwt.js';
import { sendTokenEmail } from '../../helpers/email.helper.js';
import axios from 'axios';

// Registro interno - llamado SOLO por el Auth Service .NET
export const registerInternal = async (req, res) => {
    try {
        const data = { ...req.body, isVerified: false };

        // Verificar si ya existe (idempotente)
        const existing = await User.findOne({ UserEmail: data.UserEmail });
        if (existing) {
            return res.status(200).json({
                success: true,
                message: 'Usuario ya existe en MongoDB',
                uid: existing._id
            });
        }

        const user = new User(data);
        await user.save();

        return res.status(201).json({
            success: true,
            message: 'Usuario sincronizado en MongoDB',
            uid: user._id
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const verifyInternal = async (req, res) => {
    try {
        const { UserEmail } = req.body;

        if (!UserEmail) {
            return res.status(400).json({ success: false, message: "UserEmail es requerido" });
        }

        const user = await User.findOneAndUpdate(
            { UserEmail: UserEmail.toLowerCase() },
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado en MongoDB" });
        }

        return res.status(200).json({ success: true, message: "Usuario verificado en MongoDB" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const register = async (req, res) => {
    try {
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5000';

        const response = await axios.post(`${authServiceUrl}/api/v1/auth/register`, req.body, {
            headers: { 'Content-Type': 'application/json' }
        });

        return res.status(201).json(response.data);

    } catch (err) {
        if (err.response) {
            return res.status(err.response.status).json(err.response.data);
        }
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { UserEmail, UserPassword } = req.body;
        const user = await User.findOne({ UserEmail });

        // 1. Verificar existencia y contraseña encriptada   
        if (!user || !(await user.comparePassword(UserPassword))) {
            return res.status(401).send({ message: 'Credenciales inválidas' });
        }

        // 2. bloque de verificacion
        if (!user.isVerified) {
            return res.status(403).send({
                success: false,
                message: 'Por favor, verifica tu correo electrónico antes de entrar.'
            });
        }

        const token = await generateJWT(user._id, user.UserEmail, user.UserRol);
        return res.send({ success: true, message: `Bienvenido ${user.UserName}`, token, user });

    } catch (err) {
        return res.status(500).send({ success: false, err: err.message });
    }
};

// validador del correo
export const verifyEmail = async (req, res) => {
    try {
        const user = req.user;
        user.isVerified = true;
        await user.save();
        res.send({ success: true, message: 'Cuenta activada correctamente.' });
    } catch (err) {
        res.status(500).send({ success: false, err: err.message });
    }
};