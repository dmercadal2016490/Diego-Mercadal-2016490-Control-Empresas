'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    username: String,
    password: String,
    nombreEmpresa: String,
    direccion: String,
    numero: Number,
    empleados:[{type: Schema.ObjectId, ref: 'empleado'}]
});

module.exports = mongoose.model('user', userSchema);