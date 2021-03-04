'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
//const { update } = require('../models/user.model');

function createInit(req,res){
    let user = new User();
    User.findOne({username: 'admin'},(err, find)=>{
        if(err){
            console.log('Error al crear el usuario');
        }else if(find){
            console.log('Administrador ya creado')
        }else{
            //user.username = 'admin'
            user.password = '12345'
            bcrypt.hash(user.password, null, null, (err, passwordHash)=>{
                if(err){
                    res.status(500).send({message: 'Error en la encriptación de la contraseña'})
                }else if(passwordHash){
                    user.username= 'admin';
                    user.password = passwordHash;
                    user.save((err, userSaved)=>{
                        if(err){
                            console.log('Error al crear el usuario');
                        }else if(userSaved){
                            console.log('Usuario administrador creado');
                        }else{
                            console.log('Usuario administrador no creado');
                        }
                    })
                }
            })           
        }    
    })  
}

function login(req, res){
    var params = req.body;
    
    if(params.username && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la verificación de la contraseña'});
                    }else if(checkPassword){
                        if(params.gettoken){
                            return res.send({ token: jwt.createToken(userFind)});
                        }else{
                            return res.send({ message: 'Usuario logeado'});
                        }
                    }else{
                        return res.status(404).send({message: 'Contrasea incorrecta'});
                    }
                })
            }else{
                return res.send({message: 'Ususario no encontrado'});
            }
        })
    }else{
        return res.status(401).send({message: 'Por favor ingresa los datos obligatorios'});
    }
}

function setUser(req,res){
    var user = new User();
    var params = req.body;
    var idUser = req.params.id;

    if(idUser != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        if(params.nombreEmpresa && params.username && params.numero && params.password){
            User.findOne({username: params.username}, (err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general en el servidor'});
                }else if(userFind){
                    return res.send({message: 'Nombre de usuario ya en uso'});
                }else{
                    bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en la encriptación'});
                        }else if(passwordHash){
                            user.password = passwordHash;
                            user.nombreEmpresa = params.nombreEmpresa.toLowerCase();
                            user.numero = params.numero;
                            user.username = params.username.toLowerCase();
                            user.direccion = params.direccion.toLowerCase();
    
                            user.save((err, userSaved)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al guardar'});
                                }else if(userSaved){
                                    return res.send({message: 'Usuario guardado', userSaved});
                                }else{
                                    return res.status(500).send({message: 'No se guardó el usuario'});
                                }
                            })
                        }else{
                            return res.status(401).send({message: 'Contraseña no encriptada'});
                        }
                    })
                }
            })
        }else{
            return res.send({message: 'Por favor ingresa todos los datos'});
        }
    }
}

function updateUser(req, res){
    let update = req.body;
    var idUser = req.params.idU;
    var idactu = req.params.idA;

    if(idUser != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        if(update.password){
            return res.status(401).send({ message: 'No se puede actualizar la contraseña'})
        }else{
            if(update.username){
                User.findOne({username: update.username.toLowerCase()},(err, userFind)=>{
                    if(err){
                        return res.status(500).send({ message: 'Error general'});
                    }else if(userFind){
                        return res.send({message: 'Error, username ya en uso'});
                    }else{
                        User.findByIdAndUpdate(idactu, update, {new: true},(err, userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(userUpdated){
                                return res.send({message: 'usuario actualizado', userUpdated});
                            }else{
                                return res.send({message: 'No se pudo actualizar al usuario'});
                            }
                        })
                    }
                })
            }else{
                User.findByIdAndUpdate(idactu, update, {new: true},(err, userUpdated)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al actualizar'});
                    }else if(userUpdated){
                        return res.send({message: 'usuario actualizado', userUpdated});
                    }else{
                        return res.send({message: 'No se pudo actualizar al usuario'});
                    }
                })
            }
        }
    }
}

function deleteUser(req,res){
    var idUser = req.params.idU;
    var idactu = req.params.idA;
    var params = req.body;

    if(idUser != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        User.findOne({_id: idactu}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al eliminar'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al encriptar la contraseña'});
                    }else if(checkPassword){
                        User.findByIdAndRemove(idactu, (err,userRemoved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al eliminar'});
                            }else if(userRemoved){
                                return res.send({message: 'Usuario eliminado'});
                            }else{
                                return res.status(403).send({message: 'Usuario no eliminado'});
                            }
                        })
                    }else{
                        res.status(403).send({message: 'Contraseña incorrecta'});
                    }
                })
            }else{
                return res.status(403).send({message: 'Usuario no eliminado'});
            }
        })
    }
}

function getUsers(req,res){
    User.find({}).populate('empleado').exec((err, users)=>{
        if(err){
            return res.status(500).send({message: 'Error general en el servidor'})
        }else if(users){
            return res.send({message: 'Usuarios: ', users})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    })
}

module.exports = {
    createInit, 
    login,
    setUser,
    updateUser,
    deleteUser,
    getUsers
}    