'use strict';
import axios from 'axios';

const API_KEY = 'f5437fde7c53ef8c8e2c6480';
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

export const getExchangeRate = async (from, to) => {
    try {
        const response = await axios.get(`${BASE_URL}/latest/${from}`);
        
        if (response.data.result === 'error') {
            throw new Error(response.data['error-type']);
        }

        return response.data.conversion_rates[to];
    } catch (error) {
        throw new Error('Error al obtener la tasa de cambio: ' + error.message);
    }
};

export const convertCurrency = async (amount, from, to) => {
    if (from === to) {
        return { rate: 1, result: amount };
    }

    const rate = await getExchangeRate(from, to);

    if (!rate) {
        throw new Error(`No se encontró tasa de conversión para ${to}`);
    }

    return {
        rate,
        result: (amount * rate).toFixed(2)
    };
};