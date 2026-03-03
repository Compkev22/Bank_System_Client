'use strict';

import { Schema, model } from 'mongoose';

const favoriteSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario dueño del favorito es obligatorio']
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'La cuenta bancaria a guardar es obligatoria']
    },
    alias: {
        type: String,
        required: [true, 'El alias es obligatorio'],
        maxLength: [50, 'El alias no puede tener más de 50 caracteres']
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Favorite', favoriteSchema);