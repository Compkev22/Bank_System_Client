'use strict';

import Purchase from './purchase.model.js';
import CreditCard from '../CreditCard/creditCard.model.js';
import Account from '../Account/account.model.js';
import Card from '../Card/card.model.js';

/**
 * Obtener el historial de compras de una tarjeta o cuenta propia
 * GET /api/client/purchases?cardId=...&debitCardId=...
 */
export const getMyPurchases = async (req, res) => {
    try {
        const { cardId, debitCardId } = req.query;
        const userId = req.user.id;


        if (!cardId) {
            return res.status(400).json({
                success: false,
                message: 'Debes especificar el ID de la tarjeta o cuenta (cardId)'
            });
        }

        // Verificar propiedad antes de mostrar el historial
        const isCreditCardOwner = await CreditCard.exists({ _id: cardId, user: userId });
        const isAccountOwner = await Account.exists({ _id: cardId, user: userId });

        if (!isCreditCardOwner && !isAccountOwner) {
            return res.status(403).json({
                success: false,
                message: 'No tienes acceso al historial de este método de pago'
            });
        }

        // Filtro base: todos los movimientos de esa cuenta/tarjeta de crédito
        const filter = { cardId };

        // Si viene debitCardId, validar propiedad y filtrar por tarjeta específica
        if (debitCardId) {
            const debitCardDoc = await Card.findById(debitCardId).populate('account', 'user');
            if (
                !debitCardDoc ||
                debitCardDoc.account?.user?.toString() !== userId.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes acceso a esa tarjeta de débito'
                });
            }
            filter.debitCard = debitCardId;
        }

        const purchases = await Purchase.find(filter).sort({ createdAt: -1 });

        res.status(200).json({ success: true, total: purchases.length, data: purchases });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener compras',
            error: error.message
        });
    }
};

/**
 * Procesar una nueva compra (Pasarela)
 * POST /api/client/purchases
 */
export const processMyPurchase = async (req, res) => {
    try {
        const { description, amount, type, cardId, debitCard, merchant } = req.body;
        const userId = req.user.id;

        if (type === 'CREDIT') {
            const card = await CreditCard.findOne({ _id: cardId, user: userId });

            if (!card) return res.status(404).json({
                success: false,
                message: 'Tarjeta de crédito no encontrada o no autorizada'
            });
            if (card.status !== 'ACTIVE') return res.status(400).json({
                success: false,
                message: 'Tarjeta inactiva o bloqueada'
            });
            if (amount > card.availableCredit) return res.status(400).json({
                success: false,
                message: 'Fondos insuficientes (Límite de crédito excedido)'
            });

            await CreditCard.findByIdAndUpdate(cardId, { $inc: { totalDebt: amount } });

        } else if (type === 'DEBIT') {
            // cardId sigue siendo account._id para descontar el saldo
            const account = await Account.findOne({ _id: cardId, user: userId });

            if (!account) return res.status(404).json({
                success: false,
                message: 'Cuenta vinculada no encontrada o no autorizada'
            });
            if (!account.status) return res.status(400).json({
                success: false,
                message: 'La cuenta no está activa'
            });
            if (amount > account.balance) return res.status(400).json({
                success: false,
                message: 'Saldo insuficiente en la cuenta de débito'
            });

            // Validar que la tarjeta física pertenece a esta cuenta y está activa
            if (debitCard) {
                const cardDoc = await Card.findOne({ _id: debitCard, account: cardId });
                if (!cardDoc) return res.status(404).json({
                    success: false,
                    message: 'Tarjeta de débito no encontrada para esta cuenta'
                });
                if (!cardDoc.isActive || !cardDoc.isApproved) return res.status(400).json({
                    success: false,
                    message: 'La tarjeta de débito está inactiva o no aprobada'
                });
            }

            await Account.findByIdAndUpdate(cardId, { $inc: { balance: -amount } });
        }

        const newPurchase = new Purchase({
            description,
            amount,
            type,
            cardId,
            cardType: type === 'CREDIT' ? 'CreditCard' : 'Account',
            ...(type === 'DEBIT' && debitCard ? { debitCard } : {}),
            ...(merchant ? { merchant } : {}),
        });
        await newPurchase.save();

        res.status(201).json({
            success: true,
            message: 'Compra autorizada y procesada exitosamente',
            data: newPurchase
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en el proceso de compra',
            error: error.message
        });
    }
};