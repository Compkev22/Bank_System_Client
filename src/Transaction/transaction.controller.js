'use strict'

import Account from "../Account/account.model.js"
import Transaction from "../Transaction/transaction.model.js"
import { createTransactionLogic } from "../Transaction/transaction.service.js"

/**
 * Ver mis transacciones (cuentas propias como origen o destino)
 * GET /client/transactions
 */
export const getMyTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;

        const myAccounts = await Account.find({ user: req.user.id }).distinct('_id');

        const filter = {
            $or: [
                { originAccount: { $in: myAccounts } },
                { destinationAccount: { $in: myAccounts } }
            ]
        };
        if (type) filter.type = type.toUpperCase();

        const total = await Transaction.countDocuments(filter);

        const transactions = await Transaction.find(filter)
            .populate('originAccount', 'accountNumber accountType currency')
            .populate('destinationAccount', 'accountNumber accountType currency')
            .populate('card', 'cardNumber type')
            .populate('loan', 'amount remainingBalance')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        res.status(200).json({
            success: true,
            total,
            data: transactions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener transacciones', error: error.message });
    }
};

/**
 * Ver historial formateado de una de mis cuentas
 * GET /client/transactions/account/:id
 */
export const getMyAccountHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que la cuenta pertenece al usuario autenticado
        const account = await Account.findById(id);
        if (!account) return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
        if (account.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'No autorizado: esta cuenta no te pertenece' });
        }

        const salidas = await Transaction.find({ originAccount: id })
            .populate('originAccount', 'accountNumber bank')
            .populate('destinationAccount', 'accountNumber bank');

        const entradas = await Transaction.find({ destinationAccount: id })
            .populate('originAccount', 'accountNumber bank')
            .populate('destinationAccount', 'accountNumber bank');

        const historyRaw = [...salidas, ...entradas].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const historialFormateado = historyRaw.map(tx => {
            const esSalida = tx.originAccount && tx.originAccount._id.toString() === id;
            const signo = esSalida ? '-' : '+';
            const tipoMovimiento = esSalida ? 'EGRESO' : 'INGRESO';

            let descripcion = tx.type || 'Transacción';
            if (esSalida && tx.destinationAccount)
                descripcion = `${descripcion} a cuenta ${tx.destinationAccount.accountNumber}`;
            else if (!esSalida && tx.originAccount)
                descripcion = `${descripcion} de cuenta ${tx.originAccount.accountNumber}`;

            return {
                idTransaccion: tx._id,
                fecha: tx.createdAt,
                descripcion,
                montoDisplay: `${signo}Q${tx.amount.toFixed(2)}`,
                montoReal: tx.amount,
                tipo: tipoMovimiento,
                motivoOriginal: tx.description
            };
        });

        res.status(200).json({
            success: true,
            totalMovimientos: historialFormateado.length,
            data: historialFormateado
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener historial', error: error.message });
    }
};

/**
 * Crear una transacción (transferencia, pago de servicio, etc.)
 * POST /client/transactions
 */
export const createMyTransaction = async (req, res) => {
    try {
        const {
            type, amount, currency = 'GTQ',
            AccountOriginId, AccountDestinyId,
            card, loan, description
        } = req.body;

        const ALLOWED_TYPES = ['TRANSFER', 'WITHDRAWAL', 'SERVICE_PAYMENT', 'CREDIT_CARD_PAYMENT', 'CARD_CHARGE', 'LOAN_PAYMENT'];
        if (!ALLOWED_TYPES.includes(type)) {
            return res.status(403).json({
                success: false,
                message: `Tipo de transacción no permitido para clientes. Permitidos: ${ALLOWED_TYPES.join(', ')}`
            });
        }

        const account = await Account.findById(AccountOriginId);
        if (!account)
            return res.status(404).json({ success: false, message: 'Cuenta origen no encontrada' });
        if (!account.status)
            return res.status(400).json({ success: false, message: 'La cuenta origen está inactiva' });
        if (account.user.toString() !== req.user.id.toString())
            return res.status(403).json({ success: false, message: 'La cuenta origen no te pertenece' });

        const { status, body } = await createTransactionLogic(req.body);
        return res.status(status).json(body);

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al procesar la transacción', error: error.message });
    }
};