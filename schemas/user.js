const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: String,
    id: String,
    balance: {type: Number, default: 0},
    prison: {
        inPrison: {type: Boolean, default: false},
        startedOn: {type: Number, default: 0},        
    },
    level: {type: Number, default: 0},
    rank: {type: String, default: 'Noob'},
    totalXp: {type: Number, default: 0},
});

const User = model('user', userSchema);
module.exports = User;