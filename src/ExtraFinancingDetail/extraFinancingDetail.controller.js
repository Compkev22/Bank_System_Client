import ExtraFinancingDetail from './extraFinancingDetail.model.js';
import ExtraFinancing from '../ExtraFinancing/extraFinancing.model.js';

/**
 * Ver cuotas de un financiamiento propio
 * GET /client/extra-financing-details/:financingId
 */
export const getMyFinancingDetails = async (req, res) => {
    try {
        const { financingId } = req.params;
 
        // Verificar propiedad consultando el recurso padre
        const financing = await ExtraFinancing.findById(financingId);
        if (!financing) return res.status(404).json({ success: false, message: 'Financiamiento no encontrado' });
        if (financing.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }
 
        const details = await ExtraFinancingDetail.find({ extraFinancing: financingId })
            .sort({ installmentNumber: 1 });
 
        if (!details.length) {
            return res.status(404).json({ success: false, message: 'No hay cuotas registradas para este financiamiento' });
        }
 
        res.status(200).json({ success: true, data: details });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener las cuotas', error: error.message });
    }
};