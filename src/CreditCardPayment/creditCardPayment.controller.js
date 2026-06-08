/**
 * Pagar mi tarjeta de crédito
 * POST /client/credit-cards/pay
 */
export const payCreditCard = async (req, res) => {
    try {
        const { creditCardId, accountId, amount } = req.body;
 
        const card = await CreditCard.findById(creditCardId);
        const account = await Account.findById(accountId);
 
        if (!card || !account) {
            return res.status(404).json({ success: false, message: 'Tarjeta o cuenta no encontradas' });
        }
 
        // Verificar que ambos recursos pertenecen al usuario autenticado
        if (card.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Esta tarjeta de crédito no te pertenece' });
        }
        if (account.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Esta cuenta no te pertenece' });
        }
 
        if (account.balance < amount) {
            return res.status(400).json({ success: false, message: 'Saldo insuficiente en la cuenta' });
        }
 
        await Account.findByIdAndUpdate(accountId, { $inc: { balance: -amount } });
 
        const newDebt = Math.max(0, card.totalDebt - amount);
        const newAvailable = card.creditLimit - newDebt;
        await CreditCard.findByIdAndUpdate(creditCardId, {
            $set: { totalDebt: newDebt, availableCredit: newAvailable }
        });
 
        const payment = new CreditCardPayment({ creditCard: creditCardId, account: accountId, amount });
        await payment.save();
 
        const updatedAccount = await Account.findById(accountId).select('balance');
 
        res.status(200).json({
            success: true,
            message: 'Pago de tarjeta de crédito procesado exitosamente',
            data: {
                nuevoSaldoCuenta: updatedAccount.balance,
                deudaRestante: newDebt,
                creditoDisponible: newAvailable
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al procesar el pago', error: error.message });
    }
};
 
/**
 * Ver historial de pagos de mis tarjetas de crédito
 * GET /client/credit-cards/payments?creditCardId=xxx
 */
export const getMyCreditCardPayments = async (req, res) => {
    try {
        const { creditCardId } = req.query;
 
        // Construir filtro verificando propiedad
        let filter = {};
        if (creditCardId) {
            const card = await CreditCard.findById(creditCardId);
            if (!card) return res.status(404).json({ success: false, message: 'Tarjeta no encontrada' });
            if (card.user.toString() !== req.user.id.toString()) {
                return res.status(403).json({ success: false, message: 'No autorizado' });
            }
            filter.creditCard = creditCardId;
        } else {
            // Si no se especifica tarjeta, devolver pagos de todas las tarjetas propias
            const myCards = await CreditCard.find({ user: req.user.id }).select('_id');
            filter.creditCard = { $in: myCards.map(c => c._id) };
        }
 
        const payments = await CreditCardPayment.find(filter)
            .populate('account', 'accountNumber')
            .sort({ createdAt: -1 });
 
        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener pagos', error: error.message });
    }
};