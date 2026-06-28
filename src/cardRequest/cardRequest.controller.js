'use strict';
import CardRequest from './cardRequest.model.js';
import Account from '../Account/account.model.js';

/**
 * Ver mis solicitudes de tarjeta de débito
 * GET /bankSystem/v1/cardRequests
 */
export const getMyCardRequests = async (req, res) => {
    try {
        const requests = await CardRequest.find({ user: req.user.id })
            .populate('account', 'accountNumber accountType')
            .populate('processedBy', 'UserName UserSurname')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, total: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener tus solicitudes de tarjeta',
            error: error.message
        });
    }
};

/**
 * Ver detalle de una solicitud propia
 * GET /bankSystem/v1/cardRequests/:id
 */
export const getMyCardRequestById = async (req, res) => {
    try {
        const request = await CardRequest.findOne({ _id: req.params.id, user: req.user.id })
            .populate('account', 'accountNumber accountType')
            .populate('processedBy', 'UserName UserSurname');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la solicitud',
            error: error.message
        });
    }
};

/**
 * Crear solicitud de tarjeta de débito
 * POST /bankSystem/v1/cardRequests
 */
export const createCardRequest = async (req, res) => {
    try {
        const { account, holderName, brand, deliveryAddress } = req.body;

        if (account) {
            const accountDoc = await Account.findOne({ _id: account, user: req.user.id });
            if (!accountDoc) {
                return res.status(403).json({
                    success: false,
                    message: 'La cuenta no existe o no te pertenece'
                });
            }
        }

        const cardRequest = new CardRequest({
            user: req.user.id,
            account: account || null,
            holderName,
            brand,
            deliveryAddress,
            status: 'PENDING'
        });

        await cardRequest.save();

        res.status(201).json({
            success: true,
            message: 'Solicitud de tarjeta de débito enviada. Pendiente de aprobación bancaria.',
            data: cardRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la solicitud',
            error: error.message
        });
    }
};

/**
 * Cancelar una solicitud pendiente propia
 * PATCH /bankSystem/v1/cardRequests/:id/cancel
 */
export const cancelCardRequest = async (req, res) => {
    try {
        const request = await CardRequest.findOne({ _id: req.params.id, user: req.user.id });

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