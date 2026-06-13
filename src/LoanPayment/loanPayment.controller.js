'use strict';

import Loan from '../Loan/loan.model.js';
import LoanDetail from '../LoanDetail/LoanDetail.model.js';
import Account from '../Account/account.model.js';
import Transaction from '../Transaction/transaction.model.js';
import LoanPayment from '../LoanPayment/loanPayment.model.js';

/**
 * Pagar la próxima cuota de un préstamo propio (Funcionalidad de Cliente)
 * POST /api/client/loan-payments
 */
export const payLoanInstallment = async (req, res) => {
    try {
        const { loanId, accountId } = req.body;
        const userId = req.user.id; // ID del cliente autenticado extraído del token

        // 1. Buscar ambos recursos de forma simultánea
        const loan = await Loan.findById(loanId);
        const account = await Account.findById(accountId);

        if (!loan || !account) {
            return res.status(404).json({ success: false, message: 'Préstamo o Cuenta no encontrados' });
        }

        if (loan.borrower.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No estás autorizado a realizar pagos sobre este préstamo'
            });
        }

        if (account.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'La cuenta seleccionada para el pago no te pertenece'
            });
        }

        // 4. Buscar la cuota pendiente más antigua cronológicamente
        const installment = await LoanDetail.findOne({
            loan: loanId,
            status: 'PENDING'
        }).sort({ installmentNumber: 1 });

        if (!installment) {
            return res.status(400).json({ success: false, message: 'No hay cuotas pendientes para este préstamo. ¡Al día!' });
        }

        // 5. Validar si la cuenta posee los fondos necesarios
        if (account.balance < installment.amount) {
            return res.status(400).json({ success: false, message: 'Saldo insuficiente en la cuenta seleccionada' });
        }

        // 6. Ejecutar transacciones físicas y lógicas
        // Descontar saldo de la cuenta bancaria
        await Account.findByIdAndUpdate(accountId, { $inc: { balance: -installment.amount } });

        // Liquidar el estado de la cuota actual
        installment.status = 'PAID';
        installment.paymentDate = new Date();
        await installment.save();

        // Reducir la deuda del préstamo principal basándose en el abono al capital
        loan.remainingBalance = parseFloat((loan.remainingBalance - installment.principal).toFixed(2));
        if (loan.remainingBalance <= 0) {
            loan.remainingBalance = 0;
            loan.status = 'PAID';
        }
        await loan.save();

        // 7. Generar el registro de la auditoría / historial bancario
        const transaction = new Transaction({
            type: 'LOAN_PAYMENT',
            amount: installment.amount,
            amountInGTQ: installment.amount, // ← agregar esta línea
            originAccount: account._id,
            description: `Pago de cuota #${installment.installmentNumber} del préstamo ${loan._id}`,
            status: 'COMPLETED',
            date: new Date()
        });
        await transaction.save();
        
        await LoanPayment.create({
            loan: loanId,
            account: accountId,
            installmentDetail: installment._id,
            amountPaid: installment.amount,
            description: `Pago de cuota #${installment.installmentNumber} del préstamo ${loan._id}`
        });

        // 8. Responder con el estado financiero calculado en tiempo real
        res.status(200).json({
            success: true,
            message: `Cuota #${installment.installmentNumber} procesada y pagada correctamente`,
            data: {
                nuevoSaldoCuenta: parseFloat((account.balance - installment.amount).toFixed(2)),
                saldoRestantePrestamo: loan.remainingBalance,
                cuotaPagada: installment.installmentNumber,
                estadoPrestamo: loan.status
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al procesar el pago del préstamo', error: error.message });
    }
};