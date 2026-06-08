'use strict';

import { Schema, model } from 'mongoose';

const extraFinancingDetailSchema = new Schema({
    extraFinancing: {
        type: Schema.Types.ObjectId,
        ref: 'ExtraFinancing',
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
    expectedDate: {
        type: Date,
        required: true
    },
    paymentDate: {
        type: Date,
        default: null
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

export default model('ExtraFinancingDetail', extraFinancingDetailSchema);