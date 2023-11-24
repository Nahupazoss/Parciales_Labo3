
const express = require('express');

const app = express();

app.set('puerto', 2022);

//RUTA DE PRUEBA DEL SERVIDOR
app.get('/', (request:any, response:any) => {
    response.send('GET - servidor NodeJS - jwt');
});

//#region Configuraciones

//AGREGO FILE SYSTEM
const fs = require('fs');

//AGREGO JSON
app.use(express.json());

//AGREGO JWT
const jwt = require("jsonwebtoken");

//SE ESTABLECE LA CLAVE SECRETA PARA EL TOKEN
app.set("key_jwt", "cl@ve_secreta");

app.use(express.urlencoded({extended:false}));

//AGREGO MULTER
const multer = require('multer');

//AGREGO MIME-TYPES
const mime = require('mime-types');

//AGREGO STORAGE
const storage = multer.diskStorage({

    destination: "public/juguetes/fotos/",
});

const upload = multer({

    storage: storage
});

//AGREGO CORS
const cors = require("cors");

//AGREGO MW CORS A NIVEL DE APLICACIÓN
app.use(cors());

//DIRECTORIO DE ARCHIVOS ESTÁTICOS
app.use(express.static("public"));

//AGREGO MYSQL y EXPRESS-MYCONNECTION
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'jugueteria_bd'
};

//AGREGO MW MYSQL A NIVEL DE APLICACIÓN
app.use(myconn(mysql, db_options, 'single'));

//#endregion

//##############################################################################################//
//RUTAS PARA LOS MIDDLEWARES DEL JWT
//##############################################################################################//

//#region MW verificar_jwt

//SE GENERA RUTA PARA EL MW
const verificar_jwt = express.Router();

verificar_jwt.use((request:any, response:any, next:any) => {

    //SE RECUPERA EL TOKEN DEL ENCABEZADO DE LA PETICIÓN
    let token = request.headers["authorization"];
    
    if (! token) {
        response.status(403).send({
            error: "El JWT es requerido!!!"
        });
        return;
    }

    //SE RECUPERA EL JWT DEL AUTH BEARER TOKEN
    if(token.startsWith("Bearer ")){
        token = token.slice(7, token.length);
    }

    if(token){
        //SE VERIFICA EL TOKEN CON LA CLAVE SECRETA
        jwt.verify(token, app.get("key_jwt"), (error:any, decoded:any) => {

            if(error){
                return response.json({
                    exito: false,
                    mensaje:"El JWT NO es válido!!!"
                });
            }
            else{
                //SE AGREGA EL TOKEN AL OBJETO DE LA RESPUESTA
                response.jwt = decoded;
                //SE INVOCA AL PRÓXIMO CALLEABLE
                next();
            }
        });
    }
    else{
        response.status(403).send({
            error: "El JWT está vacío!!!"
        });
    }
});

//#endregion

//#region MW solo_propietario

//SE GENERA RUTA PARA EL MW
const solo_propietario = express.Router();

solo_propietario.use(verificar_jwt, (request:any, response:any, next:any) => {

    //SE RECUPERA EL PAYLOAD DEL JWT DEL OBJETO DE LA RESPUESTA
    let usuario = response.jwt;

    if(usuario.perfil == "propietario"){
        //SE INVOCA AL PRÓXIMO CALLEABLE
         next();
    }
    else
    {
        return response.json({
            mensaje:"NO tiene perfil de 'PROPIETARIO'"
        });
    }
}/*, function (request:any, response:any, next:any) {
    console.log('Request Type:', request.method);
    next();
  }*/);

//#endregion

//##############################################################################################//
//RUTAS PARA EL TEST DE JWT
//##############################################################################################//

//#region Test JWT

//#02
app.get('/verificar_token', verificar_jwt, (request:any, response:any)=>{
    
    console.log("En el verbo GET/verificar_token");
    response.json({exito:true, jwt: response.jwt});
});

//#03
app.get('/propietario', solo_propietario, (request:any, response:any)=>{
    
    console.log("En el verbo GET/propietario");
    response.json(response.jwt);
});

//#endregion

//##############################################################################################//
//RUTAS PARA LOS MIDDLEWARES DEL JWT - CRUD BD
//##############################################################################################//

//#region verificar_usuario

const verificar_usuario = express.Router();

verificar_usuario.use((request:any, response:any, next:any) => {

    let obj = request.body;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from usuarios where correo = ? and clave = ? ", [obj.correo, obj.clave], (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            if(rows.length == 1){

                response.obj_usuario = rows[0];
                //SE INVOCA AL PRÓXIMO CALLEABLE
                next();
            }
            else{
                response.status(200).json({
                    exito : false,
                    mensaje : "clave y/o correo incorrectos.",
                    jwt : null
                });
            }
           
        });
    });
});

//#endregion

//#region modificar_eliminar - con verif

const modificar_eliminar = express.Router();

modificar_eliminar.use(verificar_jwt, (request:any, response:any, next:any)=>{

  console.log("middleware modificar");

  //SE RECUPERA EL TOKEN DEL OBJETO DE LA RESPUESTA
  let obj = response.jwt;

  if (obj.usuario.perfil == "propietario" || obj.usuario.perfil == "supervisor") {
    //SE INVOCA AL PRÓXIMO CALLEABLE
    next();
  } else {
    return response.status(401).json({
      mensaje: "NO tiene el perfil necesario para realizar la acción.",
    });
  }
});

//#endregion

//##############################################################################################//
//RUTAS PARA EL SERVIDOR DE AUTENTICACIÓN - BD
//##############################################################################################//

//#region login
app.get("/login", verificar_jwt,(request: any, response: any) => {
    response.json({exito:true, payload: response.jwt});
    let obj_respuesta = {
      exito: false,
      mensaje: "El JWT es requerido!!!",
      payload: null,
      status: 403,
    };
  
    //SE RECUPERA EL TOKEN DEL ENCABEZADO DE LA PETICIÓN
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
      //SE VERIFICA EL TOKEN CON LA CLAVE SECRETA
      jwt.verify(token, app.get("key"), (error: any, decoded: any) => {
        if (error) {
          obj_respuesta.mensaje = "El JWT NO es válido!!!";
          response.status(obj_respuesta.status).json(obj_respuesta);
        } else {
          obj_respuesta.exito = true;
          obj_respuesta.mensaje = "El JWT es valido";
          obj_respuesta.payload = decoded;
          obj_respuesta.status = 200;
          response.status(obj_respuesta.status).json(obj_respuesta);
        }
      });
    }
  });
  
app.post("/login", verificar_usuario, (request:any, response:any, obj:any) => {

    //SE RECUPERA EL USUARIO DEL OBJETO DE LA RESPUESTA
    const user = response.obj_usuario;

    //SE CREA EL PAYLOAD CON LOS ATRIBUTOS QUE SE NECESITAN
    const payload = { 
        usuario: {
            Id: user.id,
            Correo: user.correo,
            Nombre: user.nombre,
            Apellido: user.apellido,
            Foto: user.foto,
            Perfil : user.perfil
        },

        alumno: {
            Nombre: "Pazos",
            Apellido: "Nahuel"
        },

        parcial : "Segundo Parcial 2022",
    };

    //SE FIRMA EL TOKEN CON EL PAYLOAD Y LA CLAVE SECRETA
    const token = jwt.sign(payload, app.get("key_jwt"), {
        expiresIn : "2m"
    });

    response.json({
        exito : true,
        mensaje : "JWT creado!!!",
        jwt : token
    });
});

//#endregion

//##############################################################################################//
//RUTAS PARA EL CRUD - CON BD -
//##############################################################################################//

//#region LISTAR USUARIOS

app.get('/listarUsuariosBD', verificar_jwt, (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from usuarios", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            response.send(JSON.stringify(rows));
        });
    });

});

//#endregion

//#region LISTAR JUGUETES

app.get('/listarJuguetesBD', verificar_jwt, (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from juguetes", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            response.send(JSON.stringify(rows));
        });
    });

});

//#endregion

//#region AGREGAR

app.post("/agregarJugueteBD", upload.single("foto"), verificar_jwt, (request: any, response: any) => {
    let obj_respuesta = {
      exito: false,
      mensaje: "No se pudo agregar el juguete",
      status: 418,
    };
  
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let juguete_json = JSON.parse(request.body.juguete_json);
    let path: string = file.destination + juguete_json.marca + "." + extension;
  
    fs.renameSync(file.path, path);
  
    juguete_json.path_foto = path.split("public/")[1];
  
    request.getConnection((err: any, conn: any) => {
      if (err) throw "Error al conectarse a la base de datos.";
  
      conn.query("INSERT INTO juguetes set ?", [juguete_json], (err: any, rows: any) => {
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

//#endregion

//#region MODIFICAR

app.post("/toys", upload.single("foto"), verificar_jwt, (request: any, response: any) => {
    let obj_respuesta = {
      exito: false,
      mensaje: "No se pudo modificar el juguete",
      status: 418,
    };
  
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let juguete = JSON.parse(request.body.juguete);
    let path: string = file.destination + juguete.marca + "_modificacion" + "." + extension;
  
    fs.renameSync(file.path, path);
  
    juguete.path_foto = path.split("public/")[1];
  
    let jueguete_modif: any = {};
    //para excluir la pk (id)
    jueguete_modif.marca = juguete.marca;
    jueguete_modif.precio = juguete.precio;
    jueguete_modif.path_foto = juguete.path_foto;
  
    request.getConnection((err: any, conn: any) => {
      if (err) throw "Error al conectarse a la base de datos.";
  
      conn.query("UPDATE juguetes set ?  WHERE id = ?", [jueguete_modif, juguete.id_juguete], (err: any, rows: any) => {
        if (err) {
          console.log(err);
          throw "Error en consulta de base de datos.";
        }
  
        if (rows.affectedRows == 0) {
          response.status(obj_respuesta.status).json(obj_respuesta);
        } else {
          obj_respuesta.exito = true;
          obj_respuesta.mensaje = "Juguete modificado!";
          obj_respuesta.status = 200;
          response.status(obj_respuesta.status).json(obj_respuesta);
        }
      });
    });
  });

//#endregion

//#region ELIMINAR

app.delete("/toys", verificar_jwt, (request: any, response: any) => {
    let obj_respuesta = {
      exito: false,
      mensaje: "No se pudo eliminar el juguete",
      status: 418,
      
    };
  
    let id = request.body.id_juguete;
    let obj: any = {};
    obj.id = id;
  
    let path_foto: string = "public/";
  
    request.getConnection((err: any, conn: any) => {
      if (err) throw "Error al conectarse a la base de datos.";
  
      // obtengo el path de la foto del usuario a ser eliminado
      conn.query("SELECT path_foto FROM juguetes WHERE id = ?", [obj.id], (err: any, result: any) => {
        if (err) throw "Error en consulta de base de datos.";
  
        if (result.length != 0) {
          //console.log(result[0].foto);
          path_foto += result[0].path_foto;
        }
      });
    });
  
    request.getConnection((err: any, conn: any) => {
      if (err) throw "Error al conectarse a la base de datos.";
  
      conn.query("DELETE FROM juguetes WHERE id = ?", [obj.id], (err: any, rows: any) => {
        if (err) {
          console.log(err);
          throw "Error en consulta de base de datos.";
        }
  
        if (fs.existsSync(path_foto) && path_foto != "public/") {
          fs.unlink(path_foto, (err: any) => {
            if (err) throw err;
            console.log(path_foto + " fue borrado.");
          });
        }
  
        if (rows.affectedRows == 0) {
          response.status(obj_respuesta.status).json(obj_respuesta);
        } else {
          obj_respuesta.exito = true;
          obj_respuesta.mensaje = "Juguete Eliminado!";
          obj_respuesta.status = 200;
          response.status(obj_respuesta.status).json(obj_respuesta);
        }
      });
    });
  });
  
//#endregion

//#region FUNCIONES

function borrarFoto(path_foto:string) : boolean {
   
    let borrado : boolean = true;

    fs.unlink(path_foto, (err:any) => 
    {
        if (err)
        {
            console.log(err);
            borrado = false;
        }
        else
        {
            console.log(path_foto + ' fue borrado.');
        }
    });

    return borrado;
}

//#endregion

app.listen(app.get('puerto'), ()=>{
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});
