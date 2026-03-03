import User from './user.model.js';
import Account from '../Account/account.model.js';
import { generateJWT } from '../../helpers/generate-jwt.js';
import { sendTokenEmail } from '../../helpers/email.helper.js';



export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedUserId = req.user._id;
    const loggedUserRole = req.user.UserRol;

    // REGLA: El USER solo puede ver su propio perfil. El ADMIN puede ver el de cualquiera.
    if (loggedUserRole === 'USER' && loggedUserId.toString() !== id) {
        return res.status(403).json({ success: false, message: 'Acceso denegado: Solo puedes ver tu propio perfil.' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el usuario', error: error.message });
  }
};



export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedUserId = req.user._id; 
        const loggedUserRole = req.user.UserRol;
        const data = req.body;

        // REGLA: El USER solo puede editar su propio perfil.
        if (loggedUserRole === 'USER' && loggedUserId.toString() !== id) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para editar el perfil de otro usuario' });
        }

        const targetUser = await User.findById(id);
        if (!targetUser) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        // REGLA: Un Admin NO puede editar a otro Admin (solo a sí mismo)
        if (targetUser.UserRol === 'ADMIN' && loggedUserId.toString() !== id) {
            return res.status(403).json({ success: false, message: 'No puedes editar a otro usuario Administrador' });
        }

        // REGLA: Prohibido cambiar DPI o Password en esta ruta
        delete data.UserDPI;
        delete data.UserPassword;
        // REGLA EXTRA: Un usuario no puede cambiarse a sí mismo el rol para volverse ADMIN mágicamente
        delete data.UserRol; 

        const userUpdated = await User.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({ 
            success: true, 
            message: 'Perfil actualizado correctamente', 
            userUpdated 
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

