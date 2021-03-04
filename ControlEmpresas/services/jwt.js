'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-IN6AM@';

exports.createToken = (user)=>{
    var payload = {
        sub: user._id,
        username: user.username,
        nombreEmpresa: user.nombreEmpresa,
        direccion: user.direccion,
        numero: user.numero,
        iat: moment().unix(),
        exp: moment().add(4, 'hours').unix()
    }
    return jwt.encode(payload, secretKey);
}