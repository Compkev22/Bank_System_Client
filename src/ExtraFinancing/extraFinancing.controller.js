'use strict';
import ExtraFinancing from './extraFinancing.model.js';
import ExtraFinancingDetail from '../ExtraFinancingDetail/extraFinancingDetail.model.js';
import CreditCard from '../CreditCard/creditCard.model.js';

/**
 * Ver mis extra-financiamientos
 * GET /bankSystem/v1/extraFinancings
 */
export const getMyFinancings = async (req, res) => {
    try {
        const financings = await ExtraFinancing.find({ user: req.user.id })
            .populate('creditCard', 'cardNumber type');

        res.status(200).json({ success: true, data: financings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener financiamientos', error: error.message });
    }
};

/**
 * Ver financiamientos por tarjeta (propio)
 * GET /bankSystem/v1/extraFinancings/card/:creditCardId
 */
export const getMyFinancingsByCard = async (req, res) => {
    try {
        const { creditCardId } = req.params;

        // Verificar que la tarjeta pertenece al usuario
        const card = await CreditCard.findById(creditCardId);
        if (!card) return res.status(404).json({ success: false, message: 'Tarjeta no encontrada' });
        if (card.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Esta tarjeta no te pertenece' });
        }

        const financings = await ExtraFinancing.find({ creditCard: creditCardId, user: req.user.id });
        res.status(200).json({ success: true, data: financings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener financiamientos', error: error.message });
    }
};

/**
 * Solicitar un extra-financiamiento sobre una de mis tarjetas de crédito
 * POST /client/extra-financings
 */
export const requestExtraFinancing = async (req, res) => {
    try {
        const { creditCard, totalAmount, installments, description } = req.body;

        const card = await CreditCard.findById(creditCard);
        if (!card) return res.status(404).json({ success: false, message: 'Tarjeta de crédito no encontrada' });

        if (card.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Esta tarjeta de crédito no te pertenece' });
        }
        if (card.status !== 'ACTIVE') {
            return res.status(400).json({ success: false, message: 'La tarjeta no está activa para este beneficio' });
        }


        const newFinancing = new ExtraFinancing({
            description,
            creditCard,
            user: req.user.id,
            totalAmount,
            installments,
            interestRate: card.interestRate ?? 1.5,
        });

        await newFinancing.save();

        // Generar cuotas automáticamente en cascada
        const today = new Date();
        const details = Array.from({ length: installments }, (_, i) => ({
            extraFinancing: newFinancing._id,
            installmentNumber: i + 1,
            amount: monthlyPayment,
            expectedDate: new Date(today.getFullYear(), today.getMonth() + i + 1, today.getDate()),
            status: 'PENDING',
        }));

        await ExtraFinancingDetail.insertMany(details);

        res.status(201).json({
            success: true,
            message: 'Extra-financiamiento solicitado exitosamente',
            data: newFinancing,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al procesar el financiamiento', error: error.message });
    }
};