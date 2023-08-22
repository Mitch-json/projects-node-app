const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    googleId: {
        type: String,
        trim: true
    },
    facebookId: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    resetPasswordLink: {
        type: String,
        default: ''
    }
},{timestamps: true});

module.exports = mongoose.model('User', userSchema);