'use strict';

import LoanApplication from "./loanApplication.model.js";
import Loan from "../Loan/loan.model.js";
import Account from "../Account/account.model.js";
import Transaction from "../Transaction/transaction.model.js";

// Crear solicitud
export const createLoanApplication = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = req.body;

        const application = new LoanApplication({
            ...data,
            applicant: userId
        });

        await application.save();

        res.status(201).json({
            success: true,
            message: 'Solicitud enviada correctamente',
            application
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear solicitud',
            error: error.message
        });
    }
};


// Editar solicitud (solo si está PENDING y es del usuario)
export const updateLoanApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const application = await LoanApplication.findById(id);

        if (!application)
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });

        if (application.status !== 'PENDING')
            return res.status(400).json({ success: false, message: 'No se puede modificar esta solicitud' });

        if (application.applicant.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'No autorizado' });

        Object.assign(application, data);
        await application.save();

        res.status(200).json({
            success: true,
            message: 'Solicitud actualizada',
            application
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Cancelar solicitud (solo si está PENDING y es del usuario)
export const cancelLoanApplication = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await LoanApplication.findById(id);

        if (!application)
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });

        if (application.status !== 'PENDING')
            return res.status(400).json({ success: false, message: 'No se puede cancelar esta solicitud' });

        if (application.applicant.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'No autorizado' });

        application.status = 'CANCELLED';
        await application.save();

        res.status(200).json({
            success: true,
            message: 'Solicitud cancelada'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


