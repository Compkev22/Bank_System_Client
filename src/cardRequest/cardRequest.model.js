'use strict';
import { Schema, model } from 'mongoose';

const cardRequestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: false
  },
  holderName: {
    type: String,
    required: [true, 'El nombre del titular es obligatorio'],
    trim: true,
    uppercase: true
  },
  brand: {
    type: String,
    enum: ['VISA', 'MASTERCARD'],
    required: [true, 'La franquicia es obligatoria']
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
    required: true
  },
  deliveryAddress: {
    address:   { type: String, required: true },
    latitude:  { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  rejectionReason: {
    type: String,
    default: null
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

export default model('CardRequest', cardRequestSchema);