import Card from './card.model.js';
import Account from '../Account/account.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

// Crear nueva tarjeta vinculada a una cuenta
export const getMyCards = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive } = req.query;
 
        // Obtener las cuentas que pertenecen al usuario autenticado
        const myAccounts = await Account.find({ user: req.user.id }).select('_id');
        const accountIds = myAccounts.map(a => a._id);
 
        const filter = { account: { $in: accountIds } };
        if (isActive !== undefined) filter.isActive = isActive === 'true';
 
        const cards = await Card.find(filter)
            .populate({ path: 'account', select: 'accountNumber accountType balance' })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });
 
        const total = await Card.countDocuments(filter);
 
        res.status(200).json({
            success: true,
            data: cards,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener tus tarjetas', error: error.message });
    }
};
 
/**
 * Solicitar una nueva tarjeta física (solo sobre cuentas propias)
 * POST /client/cards
 */
export const requestCard = async (req, res) => {
    try {
        const data = req.body;
 
        const account = await Account.findById(data.account);
 
        if (!account) {
            if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename);
            return res.status(404).json({ success: false, message: 'Cuenta bancaria no encontrada' });
        }
 
        // El cliente solo puede crear tarjetas sobre sus propias cuentas
        if (account.user.toString() !== req.user.id.toString()) {
            if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename);
            return res.status(403).json({ success: false, message: 'No autorizado: esta cuenta no te pertenece' });
        }
 
        // Restricción: cuentas de AHORRO no admiten tarjetas de crédito
        if (account.accountType === 'AHORRO' && data.type === 'CREDIT') {
            return res.status(400).json({
                success: false,
                message: 'Las cuentas de AHORRO no pueden tener tarjetas de crédito asociadas'
            });
        }
 
        // Las tarjetas de débito se aprueban automáticamente; las de crédito requieren revisión bancaria
        data.isApproved = data.type === 'DEBIT';
 
        if (req.file) data.image = req.file.path;
 
        // Generación automática de datos de tarjeta
        const randomDigits = (n) => Math.floor(Math.random() * Math.pow(10, n)).toString().padStart(n, '0');
        data.cardNumber = '4' + randomDigits(15);
        data.cvv = randomDigits(3);
 
        const now = new Date();
        data.expirationDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear() + 4).slice(-2)}`;
 
        const card = new Card(data);
        await card.save();
        await card.populate({ path: 'account', select: 'accountNumber accountType balance' });
 
        res.status(201).json({
            success: true,
            message: data.type === 'DEBIT'
                ? 'Tarjeta de débito emitida exitosamente'
                : 'Solicitud de tarjeta de crédito enviada. Pendiente de aprobación bancaria.',
            data: card
        });
    } catch (error) {
        if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename);
        res.status(400).json({ success: false, message: 'Error al solicitar la tarjeta', error: error.message });
    }
};
 
/**
 * Activar / Desactivar mi tarjeta física
 * PATCH /client/cards/:id/status
 */
export const toggleMyCardStatus = async (req, res) => {
    try {
        const card = await Card.findById(req.params.id).populate('account', 'user');
 
        if (!card) return res.status(404).json({ success: false, message: 'Tarjeta no encontrada' });
 
        // Verificar propiedad
        if (card.account.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'No autorizado: esta tarjeta no te pertenece' });
        }
 
        card.isActive = !card.isActive;
        await card.save();
 
        res.status(200).json({
            success: true,
            message: `Tarjeta ${card.isActive ? 'activada' : 'desactivada'} correctamente`,
            data: card
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al cambiar estado', error: error.message });
    }
};