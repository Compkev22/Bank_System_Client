import LoanApplication from './loanApplication.model.js';
import Account from '../Account/account.model.js';

export const getMyLoanApplications = async (req, res) => {
    try {
        const applications = await LoanApplication.find({ applicant: req.user.id })
            .populate('account', 'accountNumber');
        res.status(200).json({ success: true, total: applications.length, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createLoanApplication = async (req, res) => {
    try {
        const { account } = req.body;
        
        // Validar que la cuenta le pertenezca al usuario antes de solicitar un préstamo hacia ella
        const accountDoc = await Account.findOne({ _id: account, user: req.user.id });
        if (!accountDoc) return res.status(403).json({ success: false, message: 'La cuenta no existe o no te pertenece' });

        const application = new LoanApplication({
            ...req.body,
            applicant: req.user.id,
            status: 'PENDING'
        });
        await application.save();

        res.status(201).json({ success: true, message: 'Solicitud enviada correctamente', data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear solicitud', error: error.message });
    }
};

export const updateLoanApplication = async (req, res) => {
    try {
        const application = await LoanApplication.findOne({ _id: req.params.id, applicant: req.user.id });

        if (!application) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        if (application.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Solo puedes modificar solicitudes pendientes' });

        Object.assign(application, req.body);
        await application.save();

        res.status(200).json({ success: true, message: 'Solicitud actualizada', data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const cancelLoanApplication = async (req, res) => {
    try {
        const application = await LoanApplication.findOne({ _id: req.params.id, applicant: req.user.id });

        if (!application) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        if (application.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Solo puedes cancelar solicitudes pendientes' });

        application.status = 'CANCELLED';
        await application.save();

        res.status(200).json({ success: true, message: 'Solicitud cancelada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};