'use strict';

import { Schema, model } from 'mongoose';

const loanDetailSchema = new Schema({
    loan: {
        type: Schema.Types.ObjectId,
        ref: 'Loan',
        required: true
    },
    installmentNumber: {
        type: Number,
        required: true
    },
    amount: {
        type: Number, 
        required: true
    },
    interest: {
        type: Number,
        default: 0
    },
    principal: {
        type: Number, 
        required: true
    },
    expectedDate: {
        type: Date, 
        required: true
    },
    paymentDate: {
        type: Date 
    },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'OVERDUE'],
        default: 'PENDING'
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('LoanDetail', loanDetailSchema);