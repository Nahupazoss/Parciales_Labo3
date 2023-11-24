"use strict";
const express = require('express');
const app = express();
app.set('puerto', 2022);
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
    destination: "public/juguetes/fotos/",
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
    database: 'jugueteria_bd'
};
app.use(myconn(mysql, db_options, 'single'));
const verificar_jwt = express.Router();
verificar_jwt.use((request, response, next) => {
    let token = request.headers["authorization"];
    if (!token) {
        response.status(403).send({
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
        response.status(403).send({
            error: "El JWT está vacío!!!"
        });
    }
});
const solo_propietario = express.Router();
solo_propietario.use(verificar_jwt, (request, response, next) => {
    let usuario = response.jwt;
    if (usuario.perfil == "propietario") {
        next();
    }
    else {
        return response.json({
            mensaje: "NO tiene perfil de 'PROPIETARIO'"
        });
    }
});
app.get('/verificar_token', verificar_jwt, (request, response) => {
    console.log("En el verbo GET/verificar_token");
    response.json({ exito: true, jwt: response.jwt });
});
app.get('/propietario', solo_propietario, (request, response) => {
    console.log("En el verbo GET/propietario");
    response.json(response.jwt);
});
const verificar_usuario = express.Router();
verificar_usuario.use((request, response, next) => {
    let obj = request.body;
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from usuarios where correo = ? and clave = ? ", [obj.correo, obj.clave], (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            if (rows.length == 1) {
                response.obj_usuario = rows[0];
                next();
            }
            else {
                response.status(200).json({
                    exito: false,
                    mensaje: "clave y/o correo incorrectos.",
                    jwt: null
                });
            }
        });
    });
});
const modificar_eliminar = express.Router();
modificar_eliminar.use(verificar_jwt, (request, response, next) => {
    console.log("middleware modificar");
    let obj = response.jwt;
    if (obj.usuario.perfil == "propietario" || obj.usuario.perfil == "supervisor") {
        next();
    }
    else {
        return response.status(401).json({
            mensaje: "NO tiene el perfil necesario para realizar la acción.",
        });
    }
});
app.get("/login", verificar_jwt, (request, response) => {
    response.json({ exito: true, payload: response.jwt });
    let obj_respuesta = {
        exito: false,
        mensaje: "El JWT es requerido!!!",
        payload: null,
        status: 403,
    };
    let token = request.headers["x-access-token"] || request.headers["authorization"];
    if (!token) {
        response.status(obj_respuesta.status).json({
            obj_respuesta,
        });
    }
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    if (token) {
        jwt.verify(token, app.get("key"), (error, decoded) => {
            if (error) {
                obj_respuesta.mensaje = "El JWT NO es válido!!!";
                response.status(obj_respuesta.status).json(obj_respuesta);
            }
            else {
                obj_respuesta.exito = true;
                obj_respuesta.mensaje = "El JWT es valido";
                obj_respuesta.payload = decoded;
                obj_respuesta.status = 200;
                response.status(obj_respuesta.status).json(obj_respuesta);
            }
        });
    }
});
app.post("/login", verificar_usuario, (request, response, obj) => {
    const user = response.obj_usuario;
    const payload = {
        usuario: {
            Id: user.id,
            Correo: user.correo,
            Nombre: user.nombre,
            Apellido: user.apellido,
            Foto: user.foto,
            Perfil: user.perfil
        },
        alumno: {
            Nombre: "Pazos",
            Apellido: "Nahuel"
        },
        parcial: "Segundo Parcial 2022",
    };
    const token = jwt.sign(payload, app.get("key_jwt"), {
        expiresIn: "2m"
    });
    response.json({
        exito: true,
        mensaje: "JWT creado!!!",
        jwt: token
    });
});
app.get('/listarUsuariosBD', verificar_jwt, (request, response) => {
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from usuarios", (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
app.get('/listarJuguetesBD', verificar_jwt, (request, response) => {
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from juguetes", (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
app.post("/agregarJugueteBD", upload.single("foto"), verificar_jwt, (request, response) => {
    let obj_respuesta = {
        exito: false,
        mensaje: "No se pudo agregar el juguete",
        status: 418,
    };
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let juguete_json = JSON.parse(request.body.juguete_json);
    let path = file.destination + juguete_json.marca + "." + extension;
    fs.renameSync(file.path, path);
    juguete_json.path_foto = path.split("public/")[1];
    request.getConnection((err, conn) => {
        if (err)
            throw "Error al conectarse a la base de datos.";
        conn.query("INSERT INTO juguetes set ?", [juguete_json], (err, rows) => {
            if (err) {
                console.log(err);
                throw "Error en consulta de base de datos.";
            }
            obj_respuesta.exito = true;
            obj_respuesta.mensaje = "Juguete agregado!";
            obj_respuesta.status = 200;
            response.status(obj_respuesta.status).json(obj_respuesta);
        });
    });
});
app.post("/toys", upload.single("foto"), verificar_jwt, (request, response) => {
    let obj_respuesta = {
        exito: false,
        mensaje: "No se pudo modificar el juguete",
        status: 418,
    };
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let juguete = JSON.parse(request.body.juguete);
    let path = file.destination + juguete.marca + "_modificacion" + "." + extension;
    fs.renameSync(file.path, path);
    juguete.path_foto = path.split("public/")[1];
    let jueguete_modif = {};
    jueguete_modif.marca = juguete.marca;
    jueguete_modif.precio = juguete.precio;
    jueguete_modif.path_foto = juguete.path_foto;
    request.getConnection((err, conn) => {
        if (err)
            throw "Error al conectarse a la base de datos.";
        conn.query("UPDATE juguetes set ?  WHERE id = ?", [jueguete_modif, juguete.id_juguete], (err, rows) => {
            if (err) {
                console.log(err);
                throw "Error en consulta de base de datos.";
            }
            if (rows.affectedRows == 0) {
                response.status(obj_respuesta.status).json(obj_respuesta);
            }
            else {
                obj_respuesta.exito = true;
                obj_respuesta.mensaje = "Juguete modificado!";
                obj_respuesta.status = 200;
                response.status(obj_respuesta.status).json(obj_respuesta);
            }
        });
    });
});
app.delete("/toys", verificar_jwt, (request, response) => {
    let obj_respuesta = {
        exito: false,
        mensaje: "No se pudo eliminar el juguete",
        status: 418,
    };
    let id = request.body.id_juguete;
    let obj = {};
    obj.id = id;
    let path_foto = "public/";
    request.getConnection((err, conn) => {
        if (err)
            throw "Error al conectarse a la base de datos.";
        conn.query("SELECT path_foto FROM juguetes WHERE id = ?", [obj.id], (err, result) => {
            if (err)
                throw "Error en consulta de base de datos.";
            if (result.length != 0) {
                path_foto += result[0].path_foto;
            }
        });
    });
    request.getConnection((err, conn) => {
        if (err)
            throw "Error al conectarse a la base de datos.";
        conn.query("DELETE FROM juguetes WHERE id = ?", [obj.id], (err, rows) => {
            if (err) {
                console.log(err);
                throw "Error en consulta de base de datos.";
            }
            if (fs.existsSync(path_foto) && path_foto != "public/") {
                fs.unlink(path_foto, (err) => {
                    if (err)
                        throw err;
                    console.log(path_foto + " fue borrado.");
                });
            }
            if (rows.affectedRows == 0) {
                response.status(obj_respuesta.status).json(obj_respuesta);
            }
            else {
                obj_respuesta.exito = true;
                obj_respuesta.mensaje = "Juguete Eliminado!";
                obj_respuesta.status = 200;
                response.status(obj_respuesta.status).json(obj_respuesta);
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