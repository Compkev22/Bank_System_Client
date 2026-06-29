'use strict';
import CreditCardRequest from './creditCardRequest.model.js';
import CreditCard from '../CreditCard/creditCard.model.js';

/**
 * Ver mis solicitudes de tarjeta de crédito
 * GET /client/credit-card-requests
 */
export const getMyCreditCardRequests = async (req, res) => {
    try {
        const cards = await CreditCard.find({ user: req.user.id }).populate('user', 'UserName UserSurname');
        const requests = await CreditCardRequest.find({ user: req.user.id })
            .populate('processedBy', 'name email')
            .populate('creditCard', 'cardNumber type status')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, total: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener tus solicitudes de tarjeta de crédito', error: error.message });
    }
};

/**
 * Ver detalle de una solicitud
 * GET /client/credit-card-requests/:id
 */
export const getMyCreditCardRequestById = async (req, res) => {
    try {
        const cards = await CreditCard.find({ user: req.user.id }).populate('user', 'UserName UserSurname');
        const request = await CreditCardRequest.findOne({ _id: req.params.id, user: req.user.id })
            .populate('processedBy', 'name email')
            .populate('creditCard', 'cardNumber type status availableCredit');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener la solicitud', error: error.message });
    }
};

/**
 * Crear solicitud de tarjeta de crédito
 * POST /client/credit-card-requests
 */
export const createCreditCardRequest = async (req, res) => {
    try {
        const { cardType, requestedCreditLimit, cutoffDate, deliveryAddress } = req.body;

        const creditCardRequest = new CreditCardRequest({
            user: req.user.id,
            cardType: cardType || 'CLASSIC',
            requestedCreditLimit,
            cutoffDate,
            deliveryAddress,
            status: 'PENDING'
        });

        await creditCardRequest.save();

        res.status(201).json({
            success: true,
            message: 'Solicitud de tarjeta de crédito enviada. Pendiente de revisión bancaria.',
            data: creditCardRequest
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear la solicitud', error: error.message });
    }
};

/**
 * Cancelar una solicitud pendiente
 * PATCH /client/credit-card-requests/:id/cancel
 */
export const cancelCreditCardRequest = async (req, res) => {
    try {
        const request = await CreditCardRequest.findOne({ _id: req.params.id, user: req.user.id });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `No puedes cancelar una solicitud en estado ${request.status}`
            });
        }

        request.status = 'CANCELLED';
        await request.save();

        res.status(200).json({ success: true, message: 'Solicitud cancelada exitosamente', data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al cancelar la solicitud', error: error.message });
    }
};