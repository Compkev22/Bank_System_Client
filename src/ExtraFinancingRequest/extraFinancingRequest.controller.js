'use strict';
import ExtraFinancingRequest from './extraFinancingRequest.model.js';
import ExtraFinancing from '../ExtraFinancing/extraFinancing.model.js';
import ExtraFinancingDetail from '../ExtraFinancingDetail/extraFinancingDetail.model.js';
import CreditCard from '../CreditCard/creditCard.model.js';

/**
 * Cliente: Ver mis solicitudes de extra-financiamiento
 * GET /bankSystem/v1/extraFinancingRequests
 */
export const getMyExtraFinancingRequests = async (req, res) => {
    try {
        const requests = await ExtraFinancingRequest.find({ user: req.user.id })
            .populate('creditCard', 'cardNumber type status')
            .populate('extraFinancing')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, total: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener las solicitudes', error: error.message });
    }
};

/**
 * Cliente: Crear solicitud de extra-financiamiento
 * POST /bankSystem/v1/extraFinancingRequests
 */
export const createExtraFinancingRequest = async (req, res) => {
    try {
        const { creditCard, description, totalAmount, installments } = req.body;

        const card = await CreditCard.findById(creditCard);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Tarjeta de crédito no encontrada' });
        }
        if (card.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Esta tarjeta no te pertenece' });
        }
        if (card.status !== 'ACTIVE') {
            return res.status(400).json({ success: false, message: 'La tarjeta debe estar activa para solicitar un financiamiento' });
        }

        // Bloquear si ya hay una solicitud PENDING para esta tarjeta
        const existing = await ExtraFinancingRequest.findOne({
            user: req.user.id,
            creditCard,
            status: 'PENDING'
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Ya tienes una solicitud pendiente para esta tarjeta' });
        }

        const request = new ExtraFinancingRequest({
            user: req.user.id,
            creditCard,
            description,
            totalAmount,
            installments,
            status: 'PENDING'
        });

        await request.save();

        res.status(201).json({
            success: true,
            message: 'Solicitud de extra-financiamiento enviada. Pendiente de revisión bancaria.',
            data: request
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear la solicitud', error: error.message });
    }
};

/**
 * Cliente: Cancelar una solicitud PENDING propia
 * PATCH /bankSystem/v1/extraFinancingRequests/:id/cancel
 */
export const cancelExtraFinancingRequest = async (req, res) => {
    try {
        const request = await ExtraFinancingRequest.findOne({ _id: req.params.id, user: req.user.id });
        if (!request) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }
        if (request.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: `No puedes cancelar una solicitud en estado ${request.status}` });
        }

        request.status = 'CANCELLED';
        await request.save();

        res.status(200).json({ success: true, message: 'Solicitud cancelada', data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al cancelar la solicitud', error: error.message });
    }
};