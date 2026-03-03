import Card from './card.model.js';
import Account from '../Account/account.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';



// Crear nueva tarjeta vinculada a una cuenta
export const createCard = async (req, res) => {
    try {

        const data = req.body;

        const account = await Account.findById(data.account);

        if (!account) {
            if (req.file && req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({
                success: false,
                message: 'La cuenta bancaria especificada no existe'
            });
        }

        if (
            account.user.toString() !== req.user._id.toString() &&
            req.user.UserRol !== 'ADMIN'
        ) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para crear tarjeta en esta cuenta'
            });
        }

        // Restricción bancaria
        if (account.accountType === 'AHORRO' && data.type === 'CREDIT') {
            return res.status(400).json({
                success: false,
                message: 'Las cuentas de AHORRO no pueden tener tarjetas de crédito asociadas.'
            });
        }

        // Aprobación automática
        data.isApproved = data.type === 'DEBIT';

        // Manejo de imagen
        if (req.file) {
            data.image = req.file.path;
        }

        const card = new Card(data);
        await card.save();

        res.status(201).json({
            success: true,
            message: 'Tarjeta creada exitosamente',
            data: card
        });

    } catch (error) {

        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename);
        }

        res.status(400).json({
            success: false,
            message: 'Error al crear la tarjeta',
            error: error.message
        });
    }
};

// Actualizar tarjeta (Imagen o Datos)
export const updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const userRole = req.user.UserRol;

        if (userRole === 'USER') {
            delete data.creditLimit;
            delete data.isApproved;
            delete data.type;
            delete data.cardNumber;
            delete data.account; 
        }

        const currentCard = await Card.findById(id);
        if (!currentCard) {
            return res.status(404).json({ success: false, message: 'Tarjeta no encontrada' });
        }

        // Si viene una nueva imagen, borramos la anterior de Cloudinary
        if (req.file) {
            if (currentCard.image && !currentCard.image.includes('default_card')) {
                // Extraemos el public_id de la URL antigua para borrarla
                // Nota: Esto asume que guardaste la URL completa. 
                // Si guardaste solo el filename, usa currentCard.image directamente.
                const nameArr = currentCard.image.split('/');
                const name = nameArr[nameArr.length - 1];
                const [publicId] = name.split('.');
                
                // Intentamos borrar usando el folder configurado
                // Ajusta 'bank_system/cards/' según tu carpeta en Cloudinary
                await cloudinary.uploader.destroy(`bank_system/cards/${publicId}`);
            }
            data.image = req.file.path;
        }
        
        const card = await Card.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({ success: true, message: 'Tarjeta actualizada', data: card });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al actualizar', error: error.message });
    }
};
