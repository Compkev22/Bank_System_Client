'use strict';

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const transactionSchema = new Schema(
    {
        type: {
            type: String,
            enum: [
                'DEPOSIT',
                'WITHDRAWAL',
                'TRANSFER',
                'SERVICE_PAYMENT',
                'LOAN_PAYMENT',
                'CARD_PAYMENT',
                'FEE'
            ],
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0.01
        },
        currency: {
            type: String,
            enum: ['GTQ', 'USD', 'EUR', 'MXN'],
            default: 'GTQ'
        },
        exchangeRate: {
            type: Number
        },
        amountInGTQ: {
            type: Number,
            required: true
        },
        originAccount: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
        },
        destinationAccount: {
            type: Schema.Types.ObjectId,
            ref: 'Account'
        },
        card: {
            type: Schema.Types.ObjectId,
            ref: 'Card'
        },
        loan: {
            type: Schema.Types.ObjectId,
            ref: 'Loan'
        },
        description: {
            type: String,
            maxlength: 255
        },
        status: {
            type: String,
            enum: ['COMPLETED', 'FAILED', 'REVERTED'],
            default: 'COMPLETED'
        }      
    },
    {
        timestamps: true
    }
);

export default model('Transaction', transactionSchema);