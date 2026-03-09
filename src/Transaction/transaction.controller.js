'use strict';

import Transaction from './transaction.model.js';
import Account from '../Account/account.model.js';
import Card from '../Card/card.model.js';
import Loan from '../Loan/loan.model.js';
import { convertCurrency } from '../Exchange/exchange.service.js';

// 1. Crear una transacción 
export const createTransaction = async (req, res) => {
    try {
        const {
            type, amount, currency = 'GTQ',
            AccountOriginId, AccountDestinyId,
            card, loan, description
        } = req.body;

        const account = await Account.findById(AccountOriginId);
        if (!account) return res.status(404).json({ success: false, message: 'Cuenta origen no encontrada' });
        if (account.state === 'INACTIVA' || account.isActive === false) return res.status(400).json({ success: false, message: 'La cuenta origen está inactiva' });

        const loggedUserId = req.user._id.toString();
        const loggedUserRole = req.user.UserRol;

        // 1. Un usuario normal NO puede tocar el dinero de una cuenta que no es suya
        if (account.user.toString() !== loggedUserId && loggedUserRole !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Fraude detectado: No puedes transferir fondos de una cuenta que no te pertenece.'
            });
        }

        // 2. Un usuario normal NO puede hacer "DEPOSIT" 
        if (type === 'DEPOSIT' && loggedUserRole !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Operación denegada: Solo los administradores o cajeros pueden hacer depósitos en efectivo.'
            });
        }
        const conversionOrigen = await convertCurrency(amount, currency, account.currency);
        const montoParaOrigen = Number(conversionOrigen.result);
        const rate = conversionOrigen.rate;

        const { result: amountInGTQ } = await convertCurrency(amount, currency, 'GTQ');

        switch (type) {
            case 'DEPOSIT':

                if (!AccountOriginId)
                    return res.status(400).json({ success: false, message: 'Cuenta requerida' });

                if (amount <= 0)
                    return res.status(400).json({ success: false, message: 'Monto inválido' });

                account.balance += montoParaOrigen;

                break;

            case 'WITHDRAWAL':
            case 'CREDIT_CARD_PAYMENT':

                if (!card)
                    return res.status(400).json({ success: false, message: 'Tarjeta requerida' });

                const creditCard = await Card.findById(card);
                if (!creditCard)
                    return res.status(404).json({ success: false, message: 'Tarjeta no encontrada' });

                if (creditCard.type !== 'CREDIT')
                    return res.status(400).json({ success: false, message: 'Solo aplica a tarjetas de crédito' });

                if (account.balance < montoParaOrigen)
                    return res.status(400).json({ success: false, message: 'Fondos insuficientes' });

                account.balance -= montoParaOrigen;

                creditCard.usedAmount -= montoParaOrigen;

                if (creditCard.usedAmount < 0)
                    creditCard.usedAmount = 0;

                await creditCard.save();

                break;
            case 'CARD_CHARGE':

                if (!card)
                    return res.status(400).json({ success: false, message: 'Tarjeta requerida' });

                const cardData = await Card.findById(card);
                if (!cardData)
                    return res.status(404).json({ success: false, message: 'Tarjeta no encontrada' });

                if (!cardData.isApproved)
                    return res.status(400).json({ success: false, message: 'Tarjeta no aprobada' });

                if (cardData.type === 'DEBIT') {

                    if (account.balance < montoParaOrigen)
                        return res.status(400).json({ success: false, message: 'Fondos insuficientes' });

                    account.balance -= montoParaOrigen;
                }

                if (cardData.type === 'CREDIT') {

                    if ((cardData.usedAmount + montoParaOrigen) > cardData.limit)
                        return res.status(400).json({ success: false, message: 'Límite de crédito excedido' });

                    cardData.usedAmount += montoParaOrigen;
                    await cardData.save();
                }

                break;
            case 'SERVICE_PAYMENT':
                if (account.balance < montoParaOrigen)
                    return res.status(400).json({ success: false, message: 'Fondos insuficientes' });
                account.balance -= montoParaOrigen;
                break;

            case 'TRANSFER':
                if (AccountOriginId === AccountDestinyId)
                    return res.status(400).json({
                        success: false,
                        message: 'No puedes transferir a la misma cuenta'
                    });
                if (!AccountDestinyId)
                    return res.status(400).json({ success: false, message: 'Cuenta destino requerida' });

                const destAccount = await Account.findById(AccountDestinyId);
                if (!destAccount)
                    return res.status(404).json({ success: false, message: 'Cuenta destino no encontrada' });
                if (destAccount.status === false) return res.status(400).json({ success: false, message: 'La cuenta destino está inactiva' });

                //Límite de Q2000 por transferencia 
                if (amountInGTQ > 2000) {
                    return res.status(400).json({ success: false, message: 'Transacción denegada: No puedes transferir más de Q2000 en una sola operación.' });
                }

                // Límite diario de Q10,000 
                // Calculamos el inicio y fin del día de hoy
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);

                // Sumamos todas las transferencias de hoy de esta cuenta
                const todayTransfers = await Transaction.aggregate([
                    {
                        $match: {
                            originAccount: account._id,
                            type: 'TRANSFER',
                            status: 'COMPLETED',
                            createdAt: { $gte: startOfDay, $lte: endOfDay }
                        }
                    },
                    { $group: { _id: null, total: { $sum: "$amountInGTQ" } } }
                ]);

                const totalToday = todayTransfers.length > 0 ? todayTransfers[0].total : 0;

                if ((totalToday + amountInGTQ) > 10000) {
                    return res.status(400).json({
                        success: false,
                        message: `Transacción denegada: Excedes el límite diario de Q10,000. Llevas transferido hoy: Q${totalToday}`
                    });
                }

                const conversionDest = await convertCurrency(amount, currency, destAccount.currency);
                const montoParaDestino = Number(conversionDest.result);

                if (account.balance < montoParaOrigen)
                    return res.status(400).json({ success: false, message: 'Fondos insuficientes' });

                account.balance -= montoParaOrigen;
                destAccount.balance += montoParaDestino;

                await destAccount.save();
                break;

            case 'LOAN_PAYMENT':
                const loanData = await Loan.findById(loan);
                if (!loanData) return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });

                if (account.balance < montoParaOrigen)
                    return res.status(400).json({ success: false, message: 'Fondos insuficientes' });

                account.balance -= montoParaOrigen;
                loanData.remainingBalance -= montoParaOrigen;
                await loanData.save();
                break;

            default:
                return res.status(400).json({ success: false, message: 'Tipo de transacción inválido' });
        }

        await account.save();
        
        const transaction = new Transaction({
            type,
            amount,
            currency,
            exchangeRate: rate,
            amountInGTQ: Number(amountInGTQ),
            originAccount: type === 'DEPOSIT' ? null : AccountOriginId,
            destinationAccount: type === 'DEPOSIT' ? AccountOriginId : AccountDestinyId,
            card,
            loan,
            description
        });

        await transaction.save();

        res.status(201).json({
            success: true,
            message: `Transacción de tipo ${type} realizada con éxito`,
            data: {
                transaccion: transaction,
                nuevoSaldoOrigen: account.balance
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al procesar transacción', error: error.message });
    }
};

// 2. Obtener todas las transacciones de un usuario general 
export const getTransactions = async (req, res) => {
    try {
        const userId = req.user._id;

        const { page = 1, limit = 10 } = req.query;

        const userAccounts = await Account.find({ user: userId }).distinct('_id');

        const transactions = await Transaction.find({
            AccountOriginId: { $in: userAccounts }
        })
            .populate({
                path: 'AccountOriginId',
                select: 'accountNumber accountType currency bank'
            })
            .populate({
                path: 'AccountDestinyId',
                select: 'accountNumber accountType currency bank user',
                populate: { path: 'user', select: 'UserName UserSurname' }
            })
            .populate('card', 'cardNumber type')
            .populate('loan', 'loanType amount')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: transactions.length,
            data: transactions,
            pagination: {
                total: transactions.length,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de transacciones',
            error: error.message
        });
    }
};

// 3. Obtener el historial ESPECÍFICO de una cuenta 
export const getAccountHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const salidas = await Transaction.find({ originAccount: id })
            .populate('originAccount', 'accountNumber bank')
            .populate('destinationAccount', 'accountNumber bank');

        const entradas = await Transaction.find({ destinationAccount: id })
            .populate('originAccount', 'accountNumber bank')
            .populate('destinationAccount', 'accountNumber bank');

        let historyRaw = [...salidas, ...entradas];
        historyRaw.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 4. Mapeamos los datos para darles formato
        const historialFormateado = historyRaw.map(tx => {
            const esSalida = tx.originAccount && tx.originAccount._id.toString() === id;

            const signo = esSalida ? '-' : '+';
            const tipoMovimiento = esSalida ? 'EGRESO' : 'INGRESO';

            let descripcionMovimiento = tx.type || 'Transacción';

            if (esSalida && tx.destinationAccount) {
                descripcionMovimiento = `${descripcionMovimiento} a cuenta ${tx.destinationAccount.accountNumber}`;
            } else if (!esSalida && tx.originAccount) {
                descripcionMovimiento = `${descripcionMovimiento} de cuenta ${tx.originAccount.accountNumber}`;
            }

            return {
                idTransaccion: tx._id,
                fecha: tx.createdAt,
                descripcion: descripcionMovimiento,
                montoDisplay: `${signo}Q${tx.amount.toFixed(2)}`,
                montoReal: tx.amount,
                tipo: tipoMovimiento,
                motivoOriginal: tx.description
            };
        });

        res.status(200).json({
            success: true,
            message: 'Historial de transacciones obtenido exitosamente',
            totalMovimientos: historialFormateado.length,
            data: historialFormateado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de la cuenta',
            error: error.message
        });
    }
};

