'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3200;
var userInit = require('./controller/user.controller');

mongoose.Promise= global.Promise;
mongoose.set('useFindAndModify', false);

mongoose.connect('mongodb://localhost:27017/ControlEmpresas', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('conectado a la base de datos');
        userInit.createInit();
        app.listen(port, ()=>{
            console.log('Servidor de express está corriendo');
        })
    })
    .catch((err)=>{
        console.log('Error al tratar de conectarse a la Base de datos', err);
    })