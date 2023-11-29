"use strict";
const express = require('express');
const app = express();
app.set('puerto', 9876);
app.get('/', (request, response) => {
    response.send('GET - servidor NodeJS - jwt');
});
const fs = require('fs');
app.use(express.json());
const jwt = require("jsonwebtoken");
app.set("key_jwt", "cl@ve_secreta");
app.use(express.urlencoded({ extended: false }));
const multer = require('multer');
const mime = require('mime-types');
const storage = multer.diskStorage({
    destination: "public/fotos/",
});
const upload = multer({
    storage: storage
});
const cors = require("cors");
app.use(cors());
app.use(express.static("public"));
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'productos_usuarios_node'
};
app.use(myconn(mysql, db_options, 'single'));
const verificar_jwt = express.Router();
verificar_jwt.use((request, response, next) => {
    let token = request.headers["authorization"];
    if (!token) {
        response.status(401).send({
            error: "El JWT es requerido!!!"
        });
        return;
    }
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    if (token) {
        jwt.verify(token, app.get("key_jwt"), (error, decoded) => {
            if (error) {
                return response.json({
                    exito: false,
                    mensaje: "El JWT NO es válido!!!"
                });
            }
            else {
                response.jwt = decoded;
                next();
            }
        });
    }
    else {
        response.status(401).send({
            error: "El JWT está vacío!!!"
        });
    }
});
const solo_admin = express.Router();
solo_admin.use(verificar_jwt, (request, response, next) => {
    let usuario = response.jwt;
    if (usuario.perfil == "administrador") {
        next();
    }
    else {
        return response.json({
            mensaje: "NO tiene perfil de 'ADMINISTRADOR'"
        });
    }
});
app.post("/crear_token", (request, response) => {
    let obj_user = request.body;
    if ((obj_user.usuario == "admin" || obj_user.usuario == "user") && obj_user.clave == "123456") {
        const payload = {
            usuario: obj_user.usuario,
            perfil: obj_user.usuario == "admin" ? "administrador" : "usuario",
            fecha: new Date(2023, 9, 12, 14, 17, 0),
        };
        const token = jwt.sign(payload, app.get("key_jwt"), {
            expiresIn: "1m"
        });
        response.json({
            exito: true,
            mensaje: "JWT creado",
            jwt: token
        });
    }
    else {
        response.json({
            exito: false,
            mensaje: "Usuario no registrado!!!",
            jwt: null
        });
    }
});
app.get('/verificar_token', verificar_jwt, (request, response) => {
    console.log("En el verbo GET/verificar_token");
    response.json({ exito: true, jwt: response.jwt });
});
app.get('/admin', solo_admin, (request, response) => {
    console.log("En el verbo GET/admin");
    response.json(response.jwt);
});
const verificar_usuario = express.Router();
verificar_usuario.use((request, response, next) => {
    let obj = request.body;
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from usuarios where legajo = ? and apellido = ? ", [obj.legajo, obj.apellido], (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            if (rows.length == 1) {
                response.obj_usuario = rows[0];
                next();
            }
            else {
                response.status(200).json({
                    exito: false,
                    mensaje: "Apellido y/o Legajo incorrectos.",
                    jwt: null
                });
            }
        });
    });
});
const agregar = express.Router();
agregar.use(verificar_jwt, (request, response, next) => {
    let obj = response.jwt;
    if (obj.usuario.Rol == "administrador") {
        next();
    }
    else {
        return response.status(401).json({
            mensaje: "NO tiene el rol necesario para realizar la acción."
        });
    }
});
const modificar_eliminar = express.Router();
modificar_eliminar.use(verificar_jwt, (request, response, next) => {
    let obj = response.jwt.usuario;
    if (obj.Rol == "administrador" || obj.Rol == "supervisor") {
        next();
    }
    else {
        return response.status(401).json({
            mensaje: "NO tiene el rol necesario para realizar la acción."
        });
    }
});
app.post("/login", verificar_usuario, (request, response, obj) => {
    const user = response.obj_usuario;
    const payload = {
        usuario: {
            Id: user.id,
            Apellido: user.apellido,
            Nombre: user.nombre,
            Rol: user.rol
        },
        api: "productos_usuarios API",
        version: "1.0.1"
    };
    const token = jwt.sign(payload, app.get("key_jwt"), {
        expiresIn: "5m"
    });
    response.json({
        exito: true,
        mensaje: "JWT creado!!!",
        jwt: token
    });
});
app.get('/productos_bd', verificar_jwt, (request, response) => {
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from productos", (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
app.post('/productos_bd', agregar, upload.single("foto"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path = file.destination + obj.codigo + "." + extension;
    fs.renameSync(file.path, path);
    obj.path = path.split("public/")[1];
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("insert into productos set ?", [obj], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            response.json({
                exito: true,
                mensaje: "Producto agregado a la bd.",
            });
        });
    });
});
app.put('/productos_bd', modificar_eliminar, upload.single("foto"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path = file.destination + obj.codigo + "." + extension;
    fs.renameSync(file.path, path);
    obj.path = path.split("public/")[1];
    let obj_modif = {};
    obj_modif.marca = obj.marca;
    obj_modif.precio = obj.precio;
    obj_modif.path = obj.path;
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("update productos set ? where codigo = ?", [obj_modif, obj.codigo], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            let hay_registro = rows.affectedRows == 0 ? false : true;
            if (!hay_registro) {
                borrarFoto("public/" + obj.path);
            }
            response.json({
                exito: hay_registro,
                mensaje: hay_registro ? "Producto modificado en la bd." : "Producto NO modificado en la bd.",
            });
        });
    });
});
app.delete('/productos_bd', modificar_eliminar, (request, response) => {
    let obj = request.body;
    let path_foto = "public/";
    let hay_registro = false;
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select path from productos where codigo = ?", [obj.codigo], (err, result) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            if (result.length > 0) {
                path_foto += result[0].path;
                hay_registro = true;
            }
            if (hay_registro) {
                request.getConnection((err, conn) => {
                    if (err)
                        throw ("Error al conectarse a la base de datos.");
                    conn.query("delete from productos where codigo = ?", [obj.codigo], (err, rows) => {
                        if (err) {
                            console.log(err);
                            throw ("Error en consulta de base de datos.");
                        }
                        borrarFoto(path_foto);
                        response.json({
                            exito: true,
                            mensaje: "Producto eliminado de la bd.",
                        });
                    });
                });
            }
            else {
                response.json({
                    exito: false,
                    mensaje: "Producto NO eliminado de la bd.",
                });
            }
        });
    });
});
function borrarFoto(path_foto) {
    let borrado = true;
    fs.unlink(path_foto, (err) => {
        if (err) {
            console.log(err);
            borrado = false;
        }
        else {
            console.log(path_foto + ' fue borrado.');
        }
    });
    return borrado;
}
app.listen(app.get('puerto'), () => {
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});
//# sourceMappingURL=servidor_node.js.map