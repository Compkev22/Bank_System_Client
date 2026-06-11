export const validateInternalRequest = (req, res, next) => {
    const apiKey = req.headers['x-internal-api-key'];
    const expectedKey = process.env.INTERNAL_API_KEY;

    if (!expectedKey || apiKey !== expectedKey) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
};