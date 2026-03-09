
import Account from "./account.model.js";

// Obtener todas las cuentas (activas)
export const getAccounts = async (req, res) => {
    try {

        let accounts;
        if (req.user.UserRol === 'USER') {
            accounts = await Account.find({
                // Usamos $or para buscar por el objeto o por el string, por si las moscas
                $or: [
                    { user: req.user._id },
                    { user: req.user._id.toString() }
                ],
                status: true
            }).populate('user', 'UserName UserSurname UserEmail');
        } 

        res.status(200).json({
            success: true,
            total: accounts.length,
            accounts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas',
            error: error.message
        });
    }
};

