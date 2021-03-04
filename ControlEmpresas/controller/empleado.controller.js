'use strict'
var Empleado = require('../models/empleado.model');
var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var pdf = require('html-pdf');

function setEmpleado(req,res){
    var userId = req.params.id;
    var params = req.body;
    var empleado = new Empleado();

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        User.findById(userId, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(userFind){
                empleado.name = params.name;
                empleado.lastname = params.lastname;
                empleado.puesto = params.puesto;
                empleado.departamento = params.departamento;
                empleado.phone = params.phone;
                
                empleado.save((err, empleadoSaved)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al guardar'})
                    }if(empleadoSaved){
                        User.findByIdAndUpdate(userId , {$push:{empleados: empleadoSaved._id}}, {new: true}, (err, empleadoPush)=>{
                            if (err){
                                return res.status(500).send({message: 'Error general al agergar el empleado'});
                            }if(empleadoPush){
                                return res.send({message: 'Empleado Guardado', empleadoPush})
                            }else{
                                return res.status(500).send({message: 'Error al agregar al empleado'});
                            }
                        })
                    }else{
                        return res.status(404).send({message: 'No se guardó el Empleado'})
                    }
                })
            }else{
                return res.status(404).send({message: 'La emprese al que deseas agregar el empleado no existe.'})
            }
        })
    }

}


function updateEmpleado(req, res){
    let userId = req.params.idU;
    let empleadoId = req.params.idE;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        if(update.puesto && update.phone){
            Empleado.findById(empleadoId, (err, EmpleadoFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al buscar'});
                }else if(EmpleadoFind){
                    User.findOne({_id: userId, empleados: empleadoId}, (err, userFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en la busqueda de usuario'});
                        }else if(userFind){
                            Empleado.findByIdAndUpdate(empleadoId, update, {new: true}, (err, empleadoUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general en la actualización'});
                                }else if(empleadoUpdated){
                                    return res.send({message: 'Empleado actualizado', empleadoUpdated});
                                }else{
                                    return res.status(404).send({message: 'Empleado no actualizado'});
                                }
                            })
                        }else{
                            return res.status(404).send({message: 'Usuario no encontrado'})
                        }
                    })
                }else{
                    return res.status(404).send({message: 'Empleado a actualizar inexistente'});
                }
            })
        }else{
            return res.status(404).send({message: 'Por favor ingresa los datos mínimos para actualizar'});
        }
    }
}

function deleteEmpleado(req, res){
    let userId = req.params.idU;
    let empleadoId = req.params.idE;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        User.findOneAndUpdate({_id: userId, empleados: empleadoId},
            {$pull:{empleados: empleadoId}}, {new:true}, (err, empleadoPull)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'});
                }if(empleadoPull){
                    Empleado.findByIdAndRemove(empleadoId, (err, empleadoRemoved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al eliminar'});
                        }else if(empleadoRemoved){
                            return res.send({message: 'Empleado eliminado', empleadoPull})
                        }else{
                            return res.status(500).send({message: 'Empleado no encontrado, o ya eliminado'})
                        }
                    })
                }else{
                    return res.status(500).send({message: 'No se pudo eliminar el Empleado'});
                }
            }).populate('empleados')
    }
}

function getEmpleados(req, res){
    var userId = req.params.id;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        Empleado.find({}).exec((err, EmpleadoFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor'})
            }else if(EmpleadoFind){
                return res.send({message: 'Empleados: ',EmpleadoFind})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

function search(req, res){
    var params =  req.body;

    if(params.search){
        Empleado.find({$or:[{name: params.search}, {lastname: params.search}, 
            {departamento: params.search},{puesto: params.search}]}, (err, resultSearch) => {
            if(err){
                return res.status(500).send({message: "Error general"})
            }else if(resultSearch){
                return res.send({message: "Encontrado", resultSearch})
            }else{
                return res.status(403).send({message: "Busqueda sin coincidencias"})
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese datos en el campo de búsqueda'});
    }
}

function pdfEmpleados(req,res){
    let userId = req.params.id;

    User.findOne({_id: userId}).exec((err,userFind)=>{
        if(err){
            res.status(500).send({mesagge: 'Error general al traer empleados'});
        }else if(userFind){
            var empleadosPDF = [];
            let empleados = userFind.empleados;
            let empleadoFound = [];

            empleados.forEach(element =>{
                empleadoFound.push(element)
            });

            console.log(empleadoFound);

            empleadoFound.forEach(element=>{
                Empleado.find({_id: element}).exec((err, empleadoEncontrado)=>{
                    if(err){
                        console.log(err);
                    }else if(empleadoFound.length >0){
                        let empleados = empleadoEncontrado;
                        empleados.forEach(element=>{
                            empleadosPDF.push(element);
                        })

                        let content =`
                                    <!doctype html>
                                    <html>
                                        <head>
                                            <meta charset = "utf-8">
                                            <title>PDF empleado</title>
                                        </head>
                                        <body>
                                            <div style="text-align:center;">
                                            <table border="1" style="margin-left: 247px; margin-top:50px;">
                                                <tbody>
                                                    <tr>
                                                        <th>Nombre</th>
                                                        <th>Apellido</th>
                                                        <th>Puesto</th>
                                                        <th>Departamento</th>
                                                        <tr>
                                                            ${empleadosPDF.map(empleado=>`
                                                                                        <tr>
                                                                                        <td>${empleado.name}</td>
                                                                                        <td>${empleado.lastname}</td>
                                                                                        <td>${empleado.puesto}</td>
                                                                                        <td>${empleado.departamento}</td>
                                                                                        </tr>
                                                            `).join(``)}
                                                        </tr>
                                                    </tr>
                                                </tbody>
                                            </div>    
                                            </table>
                                        </body>
                                    </html>
                                    `;
                                    let options = {
                                        paginationOffset : 1,
                                        "header":{
                                            "height": "45px",
                                            "contents": '<div style="text-align: center; background-color: red; color: white; font-size: 50px;">' + userFind.nombreEmpresa + '</div>'
                                        }
                                    }
                                    pdf.create(content, options).toFile('./PDF/Empleados ' + userFind.nombreEmpresa + '.pdf',
                                    function(err,res){
                                        if(err){
                                            console.log(err);
                                        }else{
                                            console.log(res);
                                        }
                                    })
                    }else{
                        res.status(404).send({message: 'No se encontro ningun dato'});
                    }
                })
            })
            res.status(300).send({message: 'El PDF ha sido creado'});
        }else{
            res.status(402).send({message: 'No existe ningun empleado'});
        }
    })
}


module.exports={
    setEmpleado,
    updateEmpleado,
    deleteEmpleado,
    getEmpleados,
    search,
    pdfEmpleados
}