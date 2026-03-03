'use strict';

import Favorite from './favorite.model.js';
import Account from '../Account/account.model.js';

// Agregar una cuenta a favoritos
export const addFavorite = async (req, res) => {
    try {
        const { accountId, alias } = req.body;
        const userId = req.user._id;

        // 1. Verificar que la cuenta que quieren guardar existe
        const account = await Account.findById(accountId);
        if (!account) return res.status(404).json({ success: false, message: 'La cuenta bancaria no existe' });
        
        // 2. Opcional pero recomendado: que no guarden cuentas inactivas
        if (!account.status) return res.status(400).json({ success: false, message: 'No puedes agregar una cuenta inactiva a favoritos' });

        // 3. Verificar que no la haya agregado ya antes
        const existingFav = await Favorite.findOne({ user: userId, account: accountId });
        if (existingFav) return res.status(400).json({ success: false, message: 'Ya tienes esta cuenta en tus favoritos' });

        const favorite = new Favorite({
            user: userId,
            account: accountId,
            alias
        });

        await favorite.save();

        res.status(201).json({
            success: true,
            message: 'Cuenta agregada a favoritos exitosamente',
            favorite
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al agregar a favoritos', error: error.message });
    }
};

// Obtener los favoritos del usuario logueado
export const getMyFavorites = async (req, res) => {
    try {
        const userId = req.user._id;

        const favorites = await Favorite.find({ user: userId })
            // Traemos el No. de cuenta y tipo como pide el requerimiento
            .populate({
                path: 'account',
                select: 'accountNumber accountType bank user',
                populate: { path: 'user', select: 'UserName UserSurname' } // Extra: Traer el nombre del dueño
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: favorites.length,
            favorites
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener favoritos', error: error.message });
    }
};

// Eliminar un favorito
export const removeFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Buscamos que el favorito exista Y que pertenezca al usuario logueado
        const favorite = await Favorite.findOneAndDelete({ _id: id, user: userId });

        if (!favorite) return res.status(404).json({ success: false, message: 'Favorito no encontrado o no tienes permiso para eliminarlo' });

        res.status(200).json({
            success: true,
            message: 'Cuenta eliminada de favoritos exitosamente'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar favorito', error: error.message });
    }
};