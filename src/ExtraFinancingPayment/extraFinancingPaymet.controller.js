import ExtraFinancingPayment from './extraFinancingPaymet.model.js';
import ExtraFinancing from '../ExtraFinancing/extraFinancing.model.js';
import ExtraFinancingDetail from '../ExtraFinancingDetail/extraFinancingDetail.model.js';
import Account from '../Account/account.model.js';

/**
 * Pagar la próxima cuota de un extra-financiamiento
 * POST /client/extra-financing-payments
 */
export const payMyFinancingInstallment = async (req, res) => {
    try {
        const { extraFinancingId, accountId } = req.body;
 
        const extra = await ExtraFinancing.findById(extraFinancingId);
        const account = await Account.findById(accountId);
 
        if (!extra || !account) {
            return res.status(404).json({ success: false, message: 'Financiamiento o cuenta no encontrados' });
        }
 
        if (extra.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Este financiamiento no te pertenece' });
        }
        if (account.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Esta cuenta no te pertenece' });
        }
 
        const installment = await ExtraFinancingDetail.findOne({
            extraFinancing: extraFinancingId,
            status: 'PENDING'
        }).sort({ installmentNumber: 1 });
 
        if (!installment) {
            return res.status(400).json({ success: false, message: 'No hay cuotas pendientes. ¡Financiamiento al día!' });
        }
        if (account.balance < installment.amount) {
            return res.status(400).json({ success: false, message: 'Saldo insuficiente en la cuenta' });
        }
 
        // Modificaciones en base de datos
        await Account.findByIdAndUpdate(accountId, { $inc: { balance: -installment.amount } });
 
        installment.status = 'PAID';
        installment.paymentDate = new Date();
        await installment.save();
 
        extra.remainingBalance -= (installment.amount - (extra.totalAmount * (extra.interestRate / 100)));
        if (extra.remainingBalance <= 0) { 
            extra.remainingBalance = 0; 
            extra.status = 'PAID'; 
        }
        await extra.save();
 
        const payment = new ExtraFinancingPayment({
            extraFinancing: extraFinancingId,
            account: accountId,
            detail: installment._id,
            amount: installment.amount
        });
        await payment.save();
 
        const updatedAccount = await Account.findById(accountId).select('balance');
 
        res.status(200).json({
            success: true,
            message: `Cuota #${installment.installmentNumber} pagada exitosamente`,
            data: {
                nuevoSaldoCuenta: updatedAccount.balance,
                saldoRestante: extra.remainingBalance,
                estadoFinanciamiento: extra.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al pagar la cuota', error: error.message });
    }
};