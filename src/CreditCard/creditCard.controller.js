'use strict'

import CreditCard from './creditCard.model.js';
/**
 * Ver mis tarjetas de crédito
 * GET /client/credit-cards
 */
export const getMyCreditCards = async (req, res) => {
    try {
        const cards = await CreditCard.find({ user: req.user.id })
            .populate('user', 'UserName UserSurname');
        res.status(200).json({ success: true, total: cards.length, data: cards });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener tus tarjetas de crédito', error: error.message });
    }
};

/**
 * Solicitar una nueva tarjeta de crédito
 * POST /client/credit-cards
 */
export const requestCreditCard = async (req, res) => {
    try {
        const { type, creditLimit } = req.body;


        // Generar número de tarjeta
        const prefix = '4213';
        const cardNumber = prefix + Math.floor(Math.random() * 1e12).toString().padStart(12, '0');

        // Tasa según tipo
        const rateMap = { CLASSIC: 2.5, GOLD: 2.2, PLATINUM: 1.8, BLACK: 1.5 };
        const interestRate = rateMap[type] ?? 2.5;

        const newCard = new CreditCard({
            cardNumber,
            user: req.user.id,
            type: type || 'CLASSIC',
            creditLimit,
            totalDebt: 0,
            availableCredit: creditLimit,
            cutoffDate: 15,
            paymentDeadline: 20,
            interestRate,
            status: 'PENDING'
        });

        await newCard.save();

        res.status(201).json({
            success: true,
            message: 'Solicitud de tarjeta de crédito enviada. Pendiente de activación.',
            data: newCard
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al solicitar tarjeta de crédito', error: error.message });
    }
};