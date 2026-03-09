'use strict';

import Loan from './loan.model.js';

// Obtener préstamos del usuario
export const getMyLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ borrower: req.user._id })
            .populate('account', 'accountNumber balance');

        res.status(200).json({
            success: true,
            total: loans.length,
            loans
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




// Obtener préstamo por ID
export const getLoanById = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id)
            .populate('borrower', 'UserName UserEmail')
            .populate('account');

        if (!loan)
            return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });

        if (
            loan.borrower._id.toString() !== req.user._id.toString() &&
            req.user.UserRol !== 'ADMIN'
        ) {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        res.status(200).json({ success: true, loan });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};