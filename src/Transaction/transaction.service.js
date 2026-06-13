'use strict';

import Transaction from './transaction.model.js';
import Account from '../Account/account.model.js';
import Card from '../Card/card.model.js';
import Loan from '../Loan/loan.model.js';
import { convertCurrency } from '../Exchange/exchange.service.js';

/**
 * Lógica pura de creación de transacción.
 * Retorna { status, body } en lugar de usar res directamente.
 */
export const createTransactionLogic = async ({
    type, amount, currency = 'GTQ',
    AccountOriginId, AccountDestinyId,
    card, loan, description
}) => {
    const account = await Account.findById(AccountOriginId);
    if (!account)
        return { status: 404, body: { success: false, message: 'Cuenta origen no encontrada' } };
    if (account.status === false)
        return { status: 400, body: { success: false, message: 'La cuenta origen está inactiva' } };

    const conversionOrigen = await convertCurrency(amount, currency, account.currency);
    const montoParaOrigen = Number(conversionOrigen.result);
    const rate = conversionOrigen.rate;

    const { result: amountInGTQ } = await convertCurrency(amount, currency, 'GTQ');

    switch (type) {
        case 'DEPOSIT': {
            if (amount <= 0)
                return { status: 400, body: { success: false, message: 'Monto inválido' } };
            account.balance += montoParaOrigen;
            break;
        }

        case 'WITHDRAWAL': {
            if (account.balance < montoParaOrigen)
                return { status: 400, body: { success: false, message: 'Fondos insuficientes' } };
            account.balance -= montoParaOrigen;
            break;
        }

        case 'CREDIT_CARD_PAYMENT': {
            if (!card)
                return { status: 400, body: { success: false, message: 'Tarjeta requerida' } };
            const creditCard = await Card.findById(card);
            if (!creditCard)
                return { status: 404, body: { success: false, message: 'Tarjeta no encontrada' } };
            if (creditCard.type !== 'CREDIT')
                return { status: 400, body: { success: false, message: 'Solo aplica a tarjetas de crédito' } };
            if (account.balance < montoParaOrigen)
                return { status: 400, body: { success: false, message: 'Fondos insuficientes' } };
            account.balance -= montoParaOrigen;
            creditCard.usedAmount -= montoParaOrigen;
            if (creditCard.usedAmount < 0) creditCard.usedAmount = 0;
            await creditCard.save();
            break;
        }

        case 'CARD_CHARGE': {
            if (!card)
                return { status: 400, body: { success: false, message: 'Tarjeta requerida' } };
            const cardData = await Card.findById(card);
            if (!cardData)
                return { status: 404, body: { success: false, message: 'Tarjeta no encontrada' } };
            if (!cardData.isApproved)
                return { status: 400, body: { success: false, message: 'Tarjeta no aprobada' } };
            if (cardData.type === 'DEBIT') {
                if (account.balance < montoParaOrigen)
                    return { status: 400, body: { success: false, message: 'Fondos insuficientes' } };
                account.balance -= montoParaOrigen;
            }
            if (cardData.type === 'CREDIT') {
                if ((cardData.usedAmount + montoParaOrigen) > cardData.limit)
                    return { status: 400, body: { success: false, message: 'Límite de crédito excedido' } };
                cardData.usedAmount += montoParaOrigen;
                await cardData.save();
            }
            break;
        }

        case 'SERVICE_PAYMENT': {
            if (account.balance < montoParaOrigen)
                return { status: 400, body: { success: false, message: 'Fondos insuficientes' } };
            account.balance -= montoParaOrigen;
            break;
        }

        case 'TRANSFER': {
            if (!AccountDestinyId)
                return { status: 400, body: { success: false, message: 'Cuenta destino requerida' } };
            if (AccountOriginId === AccountDestinyId)
                return { status: 400, body: { success: false, message: 'No puedes transferir a la misma cuenta' } };

            const destAccount = await Account.findById(AccountDestinyId);
            if (!destAccount)
                return { status: 404, body: { success: false, message: 'Cuenta destino no encontrada' } };
            if (destAccount.status === false)
                return { status: 400, body: { success: false, message: 'La cuenta destino está inactiva' } };
            if (amountInGTQ > 2000)
                return { status: 400, body: { success: false, message: 'Transacción denegada: No puedes transferir más de Q2000 en una sola operación.' } };

            const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();   endOfDay.setHours(23, 59, 59, 999);

            const todayTransfers = await Transaction.aggregate([
                { $match: { originAccount: account._id, type: 'TRANSFER', status: 'COMPLETED', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
                { $group: { _id: null, total: { $sum: '$amountInGTQ' } } }
            ]);
            const totalToday = todayTransfers[0]?.total ?? 0;

            if ((totalToday + amountInGTQ) > 10000)
                return { status: 400, body: { success: false, message: `Transacción denegada: Excedes el límite diario de Q10,000. Llevas transferido hoy: Q${totalToday}` } };

            const conversionDest = await convertCurrency(amount, currency, destAccount.currency);
            const montoParaDestino = Number(conversionDest.result);

            if (account.balance < montoParaOrigen)
                return { status: 400, body: { success: false, message: 'Fondos insuficientes' } };

            account.balance -= montoParaOrigen;
            destAccount.balance += montoParaDestino;
            await destAccount.save();
            break;
        }

        case 'LOAN_PAYMENT': {
            const loanData = await Loan.findById(loan);
            if (!loanData)
                return { status: 404, body: { success: false, message: 'Préstamo no encontrado' } };
            if (account.balance < montoParaOrigen)
                return { status: 400, body: { success: false, message: 'Fondos insuficientes' } };
            account.balance -= montoParaOrigen;
            loanData.remainingBalance -= montoParaOrigen;
            await loanData.save();
            break;
        }

        default:
            return { status: 400, body: { success: false, message: 'Tipo de transacción inválido' } };
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

    return {
        status: 201,
        body: {
            success: true,
            message: `Transacción de tipo ${type} realizada con éxito`,
            data: { transaccion: transaction, nuevoSaldoOrigen: account.balance }
        }
    };
};