import User from '../User/user.model.js';
import { generateJWT } from '../../helpers/generate-jwt.js';
import { sendTokenEmail } from '../../helpers/email.helper.js';

export const register = async (req, res) => {
    try {
        const data = req.body;
        const user = new User(data);
        await user.save();

        // Generamos token
        const token = await generateJWT(user._id, user.UserEmail, user.UserRol);
        await sendTokenEmail(user.UserEmail, token);

        return res.status(201).send({
            success: true,
            message: 'Usuario registrado. Verifica tu correo para activar la cuenta.'
        });
    } catch (err) {
        return res.status(500).send({ success: false, err: err.message });
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