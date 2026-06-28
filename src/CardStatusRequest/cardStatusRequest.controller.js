'use strict';
import CardStatusRequest from './cardStatusRequest.model.js';
import Card from '../Card/card.model.js';
import CreditCard from '../CreditCard/creditCard.model.js';
import Account from '../Account/account.model.js';

const getCardModel = (cardType) => (cardType === 'CREDIT' ? CreditCard : Card);

/**
 * Ver mis solicitudes de cambio de estado
 * GET /bankSystem/v1/cardStatusRequests
 */
export const getMyCardStatusRequests = async (req, res) => {
    try {
        const requests = await CardStatusRequest.find({ user: req.user.id })
            .populate('card', 'cardNumber brand type isActive isApproved creditLimit availableCredit totalDebt status cutoffDate')
            .populate('processedBy', 'UserName UserSurname')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener tus solicitudes de cambio de estado',
            error: error.message
        });
    }
};

/**
 * Crear solicitud de activación o desactivación (débito o crédito)
 * POST /bankSystem/v1/cardStatusRequests
 */
export const createCardStatusRequest = async (req, res) => {
    try {
        const { cardId, cardType = 'DEBIT', requestedStatus, reason } = req.body;

        const CardModel = getCardModel(cardType);
        let card;

        if (cardType === 'CREDIT') {
            // CreditCard tiene el campo `user` directo en el documento
            card = await CardModel.findById(cardId);
            if (!card) {
                return res.status(404).json({ success: false, message: 'Tarjeta no encontrada' });
            }
            if (card.user.toString() !== req.user.id.toString()) {
                return res.status(403).json({ success: false, message: 'No autorizado: esta tarjeta no te pertenece' });
            }
        } else {
            // Card (débito) tiene el user anidado a través de account
            card = await CardModel.findById(cardId).populate('account', 'user');
            if (!card) {
                return res.status(404).json({ success: false, message: 'Tarjeta no encontrada' });
            }
            if (!card.account || !card.account.user) {
                return res.status(500).json({ success: false, message: 'Error al verificar la propiedad de la tarjeta' });
            }
            if (card.account.user.toString() !== req.user.id.toString()) {
                return res.status(403).json({ success: false, message: 'No autorizado: esta tarjeta no te pertenece' });
            }

            // Solo la tarjeta de débito necesita estar aprobada
            if (!card.isApproved) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes cambiar el estado de una tarjeta que aún no ha sido aprobada'
                });
            }
        }

        const isCurrentlyActive = cardType === 'CREDIT'
            ? card.status === 'ACTIVE'
            : card.isActive;

        if (requestedStatus === 'DEACTIVATE' && !isCurrentlyActive) {
            return res.status(400).json({ success: false, message: 'La tarjeta ya está inactiva' });
        }
        if (requestedStatus === 'ACTIVATE' && isCurrentlyActive) {
            return res.status(400).json({ success: false, message: 'La tarjeta ya está activa' });
        }

        const existing = await CardStatusRequest.findOne({ card: cardId, status: 'PENDING' });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes una solicitud pendiente para esta tarjeta'
            });
        }

        const request = new CardStatusRequest({
            card: cardId,
            cardType,
            user: req.user.id,
            requestedStatus,
            reason: reason || null,
            status: 'PENDING'
        });

        await request.save();
        await CardModel.findByIdAndUpdate(cardId, { pendingStatusRequest: true });

        res.status(201).json({
            success: true,
            message: `Solicitud de ${requestedStatus === 'ACTIVATE' ? 'activación' : 'desactivación'} enviada. Pendiente de revisión bancaria.`,
            data: request
        });
    } catch (error) {
        console.error('ERROR COMPLETO:', error); // ← agrega esta línea
        res.status(500).json({
            success: false,
            message: 'Error al crear la solicitud',
            error: error.message
        });

    }
};

/**
 * Cancelar una solicitud pendiente propia
 * PATCH /bankSystem/v1/cardStatusRequests/:id/cancel
 */
export const cancelCardStatusRequest = async (req, res) => {
    try {
        const request = await CardStatusRequest.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `No puedes cancelar una solicitud en estado ${request.status}`
            });
        }

        request.status = 'REJECTED';
        await request.save();

        res.status(200).json({
            success: true,
            message: 'Solicitud cancelada exitosamente',
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la solicitud',
            error: error.message
        });
    }
};