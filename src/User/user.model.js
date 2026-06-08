'use strict';

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    UserName: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxLength: [100, 'El nombre no puede tener más de 100 caracteres']
    },
    UserSurname: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true,
        maxLength: [100, 'El apellido no puede tener más de 100 caracteres']
    },
    UserDPI: {
        type: String,
        required: [true, 'El DPI es requerido'],
        trim: true,
        maxLength: [15, 'El DPI no puede tener más de 15 caracteres']
    },
    UserEmail: {
        type: String,
        required: [true, 'El correo es requerido'],
        trim: true,
        lowercase: true,
        unique: true
    },
    UserAddress: {
        type: String,
        required: [true, 'La dirección es requerida']
    },
    UserPhone: {
        type: String,
        required: [true, 'El celular es requerido'],
        maxLength: [15, 'El celular no puede tener más de 15 caracteres']
    },
    UserJob: {
        type: String,
        required: [true, 'El nombre de trabajo es requerido']
    },
    UserIncome: {
        type: Number,
        required: [true, 'Los ingresos mensuales son requeridos']
        // Nota: La validación de los Q100 la haremos en el validador para que Postman la atrape antes.
    },
    UserPassword: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minLength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    UserStatus: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'], 
        default: 'ACTIVE' 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    UserCreatedAt: {
        type: Date,
        default: Date.now
    },
    UserRol: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    }
});

// Encriptar antes de guardar
userSchema.pre('save', async function () {
    if (!this.isModified('UserPassword')) return;
    const salt = await bcrypt.genSalt(10);
    this.UserPassword = await bcrypt.hash(this.UserPassword, salt);
});

// Metodo para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.UserPassword);
};

// Limpiar el json
userSchema.methods.toJSON = function () {
    const { __v, UserPassword, _id, ...user } = this.toObject();
    user.uid = _id;
    return user;
};

export default mongoose.model("User", userSchema);
