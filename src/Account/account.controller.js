'use strict';

import Account from './account.model.js';

/**
 * Obtener todas mis cuentas (incluye pendientes, aprobadas, rechazadas)
 * GET /api/client/accounts
 */
export const getMyAccounts = async (req, res) => {
    try {
        const userId = req.user.id;

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

        if (account.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Acceso denegado: Esta cuenta no te pertenece' });
        }

        return res.status(200).json({ success: true, data: account });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener los detalles de la cuenta', error: error.message });
    }
};

/**
 * Solicitar la apertura de una nueva cuenta bancaria
 * POST /api/client/accounts
 *
 * El usuario elige accountType, currency y bank.
 * Todo lo demás (balance, status, requestStatus, accountNumber) lo controla el backend.
 * accountNumber se asigna SOLO cuando un admin aprueba la solicitud.
 */
export const openMyAccount = async (req, res) => {
    try {
        const { accountType, currency, bank } = req.body;
        const userId = req.user.id;

        const existingPending = await Account.findOne({
            user: userId,
            accountType: accountType || 'AHORRO',
            bank: bank || 'Banco Kinal',
            requestStatus: 'PENDING'
        });

        if (existingPending) {
            return res.status(409).json({
                success: false,
                message: 'Ya tienes una solicitud pendiente para este tipo de cuenta en ese banco'
            });
        }

        const accountData = {
            accountType: accountType || 'AHORRO',
            currency: currency || 'GTQ',
            bank: bank || 'Banco Kinal',
            balance: 0,
            user: userId,
            status: false,
            requestStatus: 'PENDING'
            // accountNumber NO se incluye aquí — se asigna al aprobar
        };

        const newRequest = new Account(accountData);
        await newRequest.save();

        return res.status(201).json({
            success: true,
            message: 'Tu solicitud de apertura de cuenta fue enviada y está pendiente de aprobación',
            data: newRequest
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Datos de solicitud inválidos',
                error: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Error interno al procesar la solicitud',
            error: error.message
        });
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
                _id: account._id,
                accountNumber: account.accountNumber,
                accountType: account.accountType,
                currency: account.currency,
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al buscar la cuenta', error: error.message });
    }
};