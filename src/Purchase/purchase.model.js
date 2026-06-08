'use strict';

import { Schema, model } from 'mongoose';

const purchaseSchema = new Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'El monto debe ser mayor a 0']
    },
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },
    cardId: { 
        type: Schema.Types.ObjectId,
        required: true
    },
    merchant: {
        type: String, 
        default: 'Comercio Local'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Purchase', purchaseSchema);