'use strict';

import Purchase from './purchase.model.js';
import CreditCard from '../CreditCard/creditCard.model.js';
import Account from '../Account/account.model.js';

/**
 * Obtener el historial de compras de una tarjeta o cuenta propia
 * GET /api/client/purchases?cardId=...
 */
export const getMyPurchases = async (req, res) => {
    try {
        const { cardId } = req.query;
        const userId = req.user.id;

        if (!cardId) {
            return res.status(400).json({ success: false, message: 'Debes especificar el ID de la tarjeta o cuenta (cardId)' });
        }

        // 1. Verificar propiedad antes de mostrar el historial
        const isCreditCardOwner = await CreditCard.exists({ _id: cardId, user: userId });
        const isAccountOwner = await Account.exists({ _id: cardId, user: userId });

        if (!isCreditCardOwner && !isAccountOwner) {
            return res.status(403).json({ success: false, message: 'No tienes acceso al historial de este método de pago' });
        }

        const purchases = await Purchase.find({ cardId }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, total: purchases.length, data: purchases });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener compras', error: error.message });
    }
};

/**
 * Procesar una nueva compra (Pasarela)
 * POST /api/client/purchases
 */
export const processMyPurchase = async (req, res) => {
    try {
        const { description, amount, type, cardId } = req.body;
        const userId = req.user.id;

        if (type === 'CREDIT') {
            // Filtro de seguridad: Buscar la tarjeta asegurando que el owner sea el usuario logueado
            const card = await CreditCard.findOne({ _id: cardId, user: userId });
            
            if (!card) return res.status(404).json({ success: false, message: 'Tarjeta de crédito no encontrada o no autorizada' });
            if (card.status !== 'ACTIVE') return res.status(400).json({ success: false, message: 'Tarjeta inactiva o bloqueada' });

            // Validación de límite disponible (Asumiendo que el modelo calcula correctly el availableCredit)
            if (amount > card.availableCredit) {
                return res.status(400).json({ success: false, message: 'Fondos insuficientes (Límite de crédito excedido)' });
            }

            // Aumentar la deuda
            await CreditCard.findByIdAndUpdate(cardId, { $inc: { totalDebt: amount } });

        } else if (type === 'DEBIT') {
            // Filtro de seguridad: Buscar la cuenta asegurando que el owner sea el usuario logueado
            const account = await Account.findOne({ _id: cardId, user: userId });
            
            if (!account) return res.status(404).json({ success: false, message: 'Cuenta vinculada no encontrada o no autorizada' });
            if (account.status !== 'ACTIVE') return res.status(400).json({ success: false, message: 'La cuenta no está activa' });

            if (amount > account.balance) {
                return res.status(400).json({ success: false, message: 'Saldo insuficiente en la cuenta de débito' });
            }

            // Descontar saldo
            await Account.findByIdAndUpdate(cardId, { $inc: { balance: -amount } });
        }

        // Registrar el comprobante de la compra
        const newPurchase = new Purchase({ description, amount, type, cardId });
        await newPurchase.save();

        res.status(201).json({
            success: true,
            message: 'Compra autorizada y procesada exitosamente',
            data: newPurchase
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el proceso de compra', error: error.message });
    }
};