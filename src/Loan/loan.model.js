'use strict';

import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema(
    {
        borrower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 100
        },

        remainingBalance: {
            type: Number,
            required: true
        },

        interestRate: {
            type: Number,
            required: true
        },

        termMonths: {
            type: Number,
            required: true
        },

        startDate: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ['ACTIVE', 'PAID', 'DEFAULTED'],
            default: 'ACTIVE'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Loan', loanSchema);