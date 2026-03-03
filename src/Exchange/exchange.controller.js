'use strict';
import { convertCurrency } from './exchange.service.js';

export const convertAmount = async (req, res) => {
    try {
        const { amount, from, to } = req.body;

        if (!amount || !from || !to) {
            return res.status(400).json({
                success: false,
                message: 'Parámetros requeridos en el body: amount, from, to'
            });
        }

        const conversion = await convertCurrency(
            Number(amount),
            from.toUpperCase(),
            to.toUpperCase()
        );

        res.status(200).json({
            success: true,
            conversion: {
                from: from.toUpperCase(),
                to: to.toUpperCase(),
                originalAmount: Number(amount),
                convertedAmount: Number(conversion.result),
                rate: conversion.rate
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en la conversión',
            error: error.message
        });
    }
};