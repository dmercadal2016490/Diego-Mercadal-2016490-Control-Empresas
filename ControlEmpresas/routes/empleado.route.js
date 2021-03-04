'use strict'

var express = require('express');
var empleadoController = require('../controller/empleado.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.put('/setEmpleado/:id', mdAuth.ensureAuth, empleadoController.setEmpleado);
api.put('/:idU/updateEmpleado/:idE', mdAuth.ensureAuth, empleadoController.updateEmpleado);
api.put('/:idU/deleteEmpleado/:idE', mdAuth.ensureAuth, empleadoController.deleteEmpleado);
api.get('/getEmpleados/:id', mdAuth.ensureAuth, empleadoController.getEmpleados);
api.post('/search', empleadoController.search);
api.get('/pdfEmpleados/:id', mdAuth.ensureAuth, empleadoController.pdfEmpleados);

module.exports = api;