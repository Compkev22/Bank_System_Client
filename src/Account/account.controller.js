'use strict';

import Account from './account.model.js';

/**
 * Obtener todas mis cuentas bancarias
 * GET /api/client/accounts
 */
export const getMyAccounts = async (req, res) => {
    try {
        const userId = req.user.id;

        // Solo buscar cuentas que pertenezcan al usuario logueado
        const accounts = await Account.find({ user: userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: accounts.length,
            data: accounts
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener tus cuentas', error: error.message });
    }
};

/**
 * Obtener detalles de una cuenta específica propia
 * GET /api/client/accounts/:id
 */
export const getMyAccountDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
        }

        // 🛑 Filtro de seguridad crítico: Verificar propiedad
        if (account.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Acceso denegado: Esta cuenta no te pertenece' });
        }

        return res.status(200).json({ success: true, data: account });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener los detalles de la cuenta', error: error.message });
    }
};

/**
 * Solicitar/Crear una nueva cuenta bancaria para sí mismo
 * POST /api/client/accounts
 */
export const openMyAccount = async (req, res) => {
    try {
        const { accountType } = req.body;
        const userId = req.user.id;

        // Generar un número de cuenta único de 10 dígitos
        let isUnique = false;
        let generatedNumber = '';
        while (!isUnique) {
            generatedNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const existingAccount = await Account.findOne({ accountNumber: generatedNumber });
            if (!existingAccount) isUnique = true;
        }

        // Estructura blindada: El cliente no puede enviar su propio balance ni cambiar el status inicial
        const accountData = {
            accountNumber: generatedNumber,
            accountType: accountType || 'AHORRO',
            balance: 0, // 🛑 Siempre inicia en 0 para el cliente
            user: userId,
            status: true // Asumiendo que tu modelo usa un booleano para el estado
        };

        const newAccount = new Account(accountData);
        await newAccount.save();

        return res.status(201).json({
            success: true,
            message: 'Tu nueva cuenta bancaria ha sido aperturada exitosamente',
            data: newAccount
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno al procesar la apertura de cuenta', error: error.message });
    }
};

export const findAccountByNumber = async (req, res) => {
    try {
        const { accountNumber } = req.query;
        if (!accountNumber) return res.status(400).json({ success: false, message: 'Número de cuenta requerido' });

        const account = await Account.findOne({ accountNumber, status: true });
        if (!account) return res.status(404).json({ success: false, message: 'Cuenta no encontrada o inactiva' });

        // Solo exponemos los datos públicos necesarios
        return res.status(200).json({
            success: true,
            data: {
                _id:           account._id,
                accountNumber: account.accountNumber,
                accountType:   account.accountType,
                currency:      account.currency,
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al buscar la cuenta', error: error.message });
    }
};