import LoanDetail from './LoanDetail.model.js';
import Loan from '../Loan/loan.model.js';
import Account from '../Account/account.model.js';
import Transaction from '../Transaction/transaction.model.js';

export const getMyLoanDetails = async (req, res) => {
    try {
        const { loanId } = req.params;

        // Seguridad: Verificar que el préstamo sea del usuario
        const loan = await Loan.findOne({ _id: loanId, borrower: req.user.id });
        if (!loan) return res.status(403).json({ success: false, message: 'Préstamo no encontrado o no autorizado' });

        const details = await LoanDetail.find({ loan: loanId }).sort({ installmentNumber: 1 });
        res.status(200).json({ success: true, data: details });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener detalles', error: error.message });
    }
};

export const payMyInstallment = async (req, res) => {
    try {
        const { loanId, accountId } = req.body;

        // Seguridad estricta: Validar pertenencia de ambas partes al token
        const loan = await Loan.findOne({ _id: loanId, borrower: req.user.id });
        const account = await Account.findOne({ _id: accountId, user: req.user.id });

        if (!loan || !account) return res.status(403).json({ success: false, message: 'Préstamo o Cuenta no encontrados/autorizados' });

        const installment = await LoanDetail.findOne({ loan: loanId, status: 'PENDING' }).sort({ installmentNumber: 1 });
        if (!installment) return res.status(400).json({ success: false, message: 'No hay cuotas pendientes' });

        if (account.balance < installment.amount) return res.status(400).json({ success: false, message: 'Saldo insuficiente' });

        // Ejecutar transacciones
        await Account.findByIdAndUpdate(accountId, { $inc: { balance: -installment.amount } });
        await LoanDetail.findByIdAndUpdate(installment._id, { status: 'PAID', paymentDate: new Date() });

        const remainingPending = await LoanDetail.countDocuments({ loan: loanId, status: 'PENDING' });
        const newBalance = remainingPending === 0 ? 0 : parseFloat((loan.remainingBalance - installment.principal).toFixed(2));
        const newStatus = remainingPending === 0 ? 'PAID' : loan.status;

        await Loan.findByIdAndUpdate(loanId, { remainingBalance: newBalance, status: newStatus });

        // Registrar movimiento
        await Transaction.create({
            type: 'LOAN_PAYMENT',
            amount: installment.amount,
            amountInGTQ: installment.amount, // ← agregar esta línea
            originAccount: accountId,
            loan: loanId,
            description: `Pago de cuota #${installment.installmentNumber} del préstamo`,
            status: 'COMPLETED'
        });

        res.status(200).json({
            success: true,
            message: `Cuota #${installment.installmentNumber} pagada exitosamente`,
            data: { nuevoSaldoCuenta: account.balance - installment.amount, saldoRestantePrestamo: newBalance }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al procesar el pago', error: error.message });
    }
};