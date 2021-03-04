'use strict'

var express = require('express');
var userController = require('../controller/user.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/login', userController.login);
api.post('/setUser/:id', [mdAuth.ensureAuth,mdAuth.ensureAuthAdmin], userController.setUser);
api.put('/:idA/updateUser/:idU', [mdAuth.ensureAuth,mdAuth.ensureAuthAdmin], userController.updateUser);
api.delete('/:idA/deleteUser/:idU', [mdAuth.ensureAuth,mdAuth.ensureAuthAdmin], userController.deleteUser);
api.get('/getUsers', [mdAuth.ensureAuth,mdAuth.ensureAuthAdmin], userController.getUsers);
module.exports = api;