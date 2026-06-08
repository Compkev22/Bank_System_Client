'use strict'

import Loan from './loan.model.js';

export const getMyLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ borrower: req.user.id })
            .populate('account', 'accountNumber balance status');

        res.status(200).json({ success: true, total: loans.length, data: loans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener tus préstamos', error: error.message });
    }
};

export const getMyLoanById = async (req, res) => {
    try {
        const loan = await Loan.findOne({ _id: req.params.id, borrower: req.user.id })
            .populate('account', 'accountNumber');

        if (!loan) return res.status(404).json({ success: false, message: 'Préstamo no encontrado o no autorizado' });

        res.status(200).json({ success: true, data: loan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el préstamo', error: error.message });
    }
};