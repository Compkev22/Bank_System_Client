'use strict';

import Favorite from './favorite.model.js';
import Account from '../Account/account.model.js';

// Agregar una cuenta a favoritos
export const addFavorite = async (req, res) => {
    try {
        const { accountNumber, alias } = req.body;
        const userId = req.user.id;

        // Buscar la cuenta por número de cuenta en lugar de ID
        const account = await Account.findOne({ accountNumber });
        if (!account) return res.status(404).json({ success: false, message: 'La cuenta bancaria no existe' });

        if (!account.status) return res.status(400).json({ success: false, message: 'No puedes agregar una cuenta inactiva a favoritos' });

        const existingFav = await Favorite.findOne({ user: userId, account: account._id });
        if (existingFav) return res.status(400).json({ success: false, message: 'Ya tienes esta cuenta en tus favoritos' });

        const favorite = new Favorite({
            user: userId,
            account: account._id,
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
        const userId = req.user.id;

        const favorites = await Favorite.find({ user: userId })
            .populate({
                path: 'account',
                select: 'accountNumber accountType bank user',
                populate: { path: 'user', select: 'UserName UserSurname' }
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
        const userId = req.user.id;

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