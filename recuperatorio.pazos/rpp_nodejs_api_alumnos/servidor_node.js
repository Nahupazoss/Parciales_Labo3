"use strict";
const express = require('express');
const app = express();
app.set('puerto', 2023);
const fs = require('fs');
app.use(express.json());
const multer = require('multer');
const mime = require('mime-types');
const storage = multer.diskStorage({
    destination: "public/autos/fotos/",
});
const upload = multer({
    storage: storage
});
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'garage_bd'
};
app.use(myconn(mysql, db_options, 'single'));
const cors = require("cors");
app.use(cors());
app.use(express.static("public"));
app.post('/agregarAutoBD', (request, response) => {
    request.getConnection((err, conn) => {
        let obj = (request.body);
        let obj_rta = {};
        obj_rta.exito = true;
        obj_rta.mensaje = "Auto agregado en BD";
        if (err) {
            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {
            conn.query("insert into autos set ?", [obj], (err, rows) => {
                if (err) {
                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error en consulta de base de datos.";
                }
            });
        }
        response.send(JSON.stringify(obj_rta));
    });
});
app.get('/listarAutosBD', (request, response) => {
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select patente, marca, color, precio from autos", (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
app.post('/modificarAutoBD', (request, response) => {
    let obj = request.body;
    let obj_rta = {};
    obj_rta.exito = true;
    obj_rta.mensaje = "Auto modificado en BD";
    request.getConnection((err, conn) => {
        if (err) {
            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {
            conn.query("update autos set ? where patente = ?", [obj, obj.patente], (err, rows) => {
                if (err) {
                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error en consulta de base de datos.";
                }
            });
        }
        response.send(JSON.stringify(obj_rta));
    });
});
app.post('/eliminarAutoBD', (request, response) => {
    let obj = request.body;
    let obj_rta = {};
    obj_rta.exito = true;
    obj_rta.mensaje = "Auto eliminado en BD";
    request.getConnection((err, conn) => {
        if (err) {
            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {
            conn.query("delete from Autos where patente = ?", [obj.patente], (err, rows) => {
                if (err) {
                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error en consulta de base de datos.";
                }
            });
        }
        response.send(JSON.stringify(obj_rta));
    });
});
app.get('/listarAutoFotosBD', (request, response) => {
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select patente, marca, color, precio, foto from autos", (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
app.post('/agregarAutoFotoBD', upload.single("foto"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = request.body;
    let path = file.destination + obj.patente + "." + extension;
    fs.renameSync(file.path, path);
    obj.foto = path.split("public/")[1];
    let obj_rta = {};
    obj_rta.exito = true;
    obj_rta.mensaje = "Auto con foto agregado en BD";
    request.getConnection((err, conn) => {
        if (err) {
            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {
            conn.query("insert into autos set ?", [obj], (err, rows) => {
                if (err) {
                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error en consulta de base de datos.";
                }
            });
        }
    });
    response.send(JSON.stringify(obj_rta));
});
app.post('/modificarAutoFotoBD', upload.single("foto"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.autoFoto_json);
    let path = file.destination + obj.patente + "." + extension;
    fs.renameSync(file.path, path);
    let obj_modif = {};
    obj_modif.marca = obj.marca;
    obj_modif.color = obj.color;
    obj_modif.precio = obj.precio;
    obj_modif.foto = path.split("public/")[1];
    let obj_rta = {};
    obj_rta.exito = true;
    obj_rta.mensaje = "Auto con foto modificado en BD";
    request.getConnection((err, conn) => {
        if (err) {
            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {
            conn.query("update autos set ? where patente = ?", [obj_modif, obj.patente], (err, rows) => {
                if (err) {
                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error en consulta de base de datos.";
                }
            });
        }
        response.send(JSON.stringify(obj_rta));
    });
});
app.post('/eliminarAutoFotoBD', (request, response) => {
    let obj = request.body;
    let path_foto = "public/";
    let obj_rta = {};
    obj_rta.exito = true;
    obj_rta.mensaje = "Auto con foto eliminado en BD";
    request.getConnection((err, conn) => {
        if (err) {
            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {
            conn.query("select foto from autos where patente = ?", [obj.patente], (err, result) => {
                if (err) {
                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error al conectarse a la base de datos.";
                }
                else {
                    path_foto += result[0].foto;
                }
            });
        }
    });
    request.getConnection((err, conn) => {
        if (err) {
            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {
            conn.query("delete from autos where patente = ?", [obj.patente], (err, rows) => {
                fs.unlink(path_foto, (err) => {
                    if (err) {
                        obj_rta.exito = false;
                        obj_rta.mensaje = "Error al eliminar foto.";
                    }
                });
            });
        }
        response.send(JSON.stringify(obj_rta));
    });
});
app.listen(app.get('puerto'), () => {
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});
//# sourceMappingURL=servidor_node.js.map