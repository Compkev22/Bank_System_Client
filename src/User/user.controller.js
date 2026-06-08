/**
 * Ver mi perfil
 * GET /client/profile
 */
export const getMyProfile = async (req, res) => {
    try {
        // req.user ya viene del middleware de autenticación
        // Solo exponemos campos seguros, nunca la contraseña
        const { UserPassword, ...safeUser } = req.user.toObject ? req.user.toObject() : req.user;
 
        res.status(200).json({ success: true, data: safeUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el perfil', error: error.message });
    }
};
 
/**
 * Actualizar mi perfil (campos permitidos)
 * PUT /client/profile
 */
export const updateMyProfile = async (req, res) => {
    try {
        const data = req.body;
 
        // El cliente no puede cambiar campos sensibles/estructurales
        delete data.UserDPI;
        delete data.UserPassword;
        delete data.UserRol;
        delete data.UserStatus;
        delete data.isVerified;
 
        const updated = await User.findByIdAndUpdate(req.user.id, data, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
 
        const { UserPassword: _pw, ...safeUser } = updated.toObject();
 
        res.status(200).json({ success: true, message: 'Perfil actualizado correctamente', data: safeUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar el perfil', error: error.message });
    }
};