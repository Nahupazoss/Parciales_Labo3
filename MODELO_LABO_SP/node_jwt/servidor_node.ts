
const express = require('express');

const app = express();

app.set('puerto', 9876);

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

    destination: "public/fotos/",
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
    database: 'productos_usuarios_node'
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
        response.status(401).send({
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
        response.status(401).send({
            error: "El JWT está vacío!!!"
        });
    }
});

//#endregion

//#region MW solo_admin

//SE GENERA RUTA PARA EL MW
const solo_admin = express.Router();

solo_admin.use(verificar_jwt, (request:any, response:any, next:any) => {

    //SE RECUPERA EL PAYLOAD DEL JWT DEL OBJETO DE LA RESPUESTA
    let usuario = response.jwt;

    if(usuario.perfil == "administrador"){
        //SE INVOCA AL PRÓXIMO CALLEABLE
         next();
    }
    else
    {
        return response.json({
            mensaje:"NO tiene perfil de 'ADMINISTRADOR'"
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

//#01
app.post("/crear_token", (request:any, response:any)=>{

    let obj_user = request.body;

    if((obj_user.usuario == "admin" || obj_user.usuario == "user") && obj_user.clave == "123456")
    {
        //SE CREA EL PAYLOAD CON LOS ATRIBUTOS QUE SE NECESITAN
        //https://www.npmjs.com/package/jsonwebtoken
        const payload = { 
            usuario: obj_user.usuario,
            perfil: obj_user.usuario == "admin" ? "administrador" : "usuario",
            fecha: new Date(2023,9,12,14,17,0),
        };

        //SE FIRMA EL TOKEN CON EL PAYLOAD Y LA CLAVE SECRETA
        const token = jwt.sign(payload, app.get("key_jwt"), {
            expiresIn : "1m"
            //exp: Math.floor(Date.now() / 1000) + 60
        });

        response.json({
            exito: true,
            mensaje : "JWT creado",
            jwt : token
        });
    }
    else
    {
        response.json({
            exito: false,
            mensaje : "Usuario no registrado!!!",
            jwt : null
        });
    }
});

//#02
app.get('/verificar_token', verificar_jwt, (request:any, response:any)=>{
    
    console.log("En el verbo GET/verificar_token");
    response.json({exito:true, jwt: response.jwt});
});

//#03
app.get('/admin', solo_admin, (request:any, response:any)=>{
    
    console.log("En el verbo GET/admin");
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

        conn.query("select * from usuarios where legajo = ? and apellido = ? ", [obj.legajo, obj.apellido], (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            if(rows.length == 1){

                response.obj_usuario = rows[0];
                //SE INVOCA AL PRÓXIMO CALLEABLE
                next();
            }
            else{
                response.status(200).json({
                    exito : false,
                    mensaje : "Apellido y/o Legajo incorrectos.",
                    jwt : null
                });
            }
           
        });
    });
});

//#endregion

//#region agregar - con verif

const agregar = express.Router();

agregar.use(verificar_jwt, (request:any, response:any, next:any) => {

    //SE RECUPERA EL PAYLOAD DEL JWT DEL OBJETO DE LA RESPUESTA
    let obj = response.jwt;

    if(obj.usuario.Rol == "administrador"){
        //SE INVOCA AL PRÓXIMO CALLEABLE
         next();
    }
    else{
        return response.status(401).json({
            mensaje:"NO tiene el rol necesario para realizar la acción."
        });
    }
});

//#endregion

//#region modificar_eliminar - con verif

const modificar_eliminar = express.Router();

modificar_eliminar.use(verificar_jwt, (request:any, response:any, next:any)=>{

    //SE RECUPERA EL USUARIO DEL PAYLOAD DEL JWT DEL OBJETO DE LA RESPUESTA
    let obj = response.jwt.usuario;

    if(obj.Rol == "administrador" || obj.Rol == "supervisor"){
        //SE INVOCA AL PRÓXIMO CALLEABLE
        next();
    }
    else{
        return response.status(401).json({
            mensaje:"NO tiene el rol necesario para realizar la acción."
        });
    }   
});

//#endregion

//##############################################################################################//
//RUTAS PARA EL SERVIDOR DE AUTENTICACIÓN - BD
//##############################################################################################//

//#region login

app.post("/login", verificar_usuario, (request:any, response:any, obj:any) => {

    //SE RECUPERA EL USUARIO DEL OBJETO DE LA RESPUESTA
    const user = response.obj_usuario;

    //SE CREA EL PAYLOAD CON LOS ATRIBUTOS QUE SE NECESITAN
    const payload = { 
        usuario: {
            Id : user.id,
            Apellido : user.apellido,
            Nombre : user.nombre,
            Rol : user.rol
        },
        api : "productos_usuarios API",
        version : "1.0.1"
    };

    //SE FIRMA EL TOKEN CON EL PAYLOAD Y LA CLAVE SECRETA
    const token = jwt.sign(payload, app.get("key_jwt"), {
        expiresIn : "5m"
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

//#region LISTAR

app.get('/productos_bd', verificar_jwt, (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from productos", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            response.send(JSON.stringify(rows));
        });
    });

});

//#endregion

//#region AGREGAR

app.post('/productos_bd', agregar, upload.single("foto"), (request:any, response:any)=>{
   
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path : string = file.destination + obj.codigo + "." + extension;

    fs.renameSync(file.path, path);

    obj.path = path.split("public/")[1];

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("insert into productos set ?", [obj], (err:any, rows:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}

            response.json({
                exito : true,
                mensaje : "Producto agregado a la bd.",
            });
        });
    });
});

//#endregion

//#region MODIFICAR

app.put('/productos_bd', modificar_eliminar, upload.single("foto"), (request:any, response:any)=>{
    
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path : string = file.destination + obj.codigo + "." + extension;

    fs.renameSync(file.path, path);

    obj.path = path.split("public/")[1];

    let obj_modif : any = {};
    //para excluir la pk (codigo)
    obj_modif.marca = obj.marca;
    obj_modif.precio = obj.precio;
    obj_modif.path = obj.path;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("update productos set ? where codigo = ?", [obj_modif, obj.codigo], (err:any, rows:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}
            
            //console.log(rows);
            let hay_registro = rows.affectedRows == 0 ? false : true;

            if( ! hay_registro)
            {
                borrarFoto("public/"+obj.path);
            }

            response.json({
                exito : hay_registro,
                mensaje : hay_registro ? "Producto modificado en la bd." : "Producto NO modificado en la bd.",
            });
        });
    });
});

//#endregion

//#region ELIMINAR

app.delete('/productos_bd', modificar_eliminar, (request:any, response:any)=>{
   
    let obj = request.body;
    let path_foto : string = "public/";
    let hay_registro = false;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        //obtengo el path de la foto del producto a ser eliminado
        conn.query("select path from productos where codigo = ?", [obj.codigo], (err:any, result:any)=>{

            if(err) throw("Error en consulta de base de datos.");
            
            //console.log(result.length);
            if(result.length > 0)
            {
                path_foto += result[0].path;
                hay_registro = true;
            }

            if(hay_registro)
            {
                request.getConnection((err:any, conn:any)=>{

                    if(err) throw("Error al conectarse a la base de datos.");

                    conn.query("delete from productos where codigo = ?", [obj.codigo], (err:any, rows:any)=>{

                        if(err) {console.log(err); throw("Error en consulta de base de datos.");}


                        borrarFoto(path_foto);

                        response.json({
                            exito : true,
                            mensaje : "Producto eliminado de la bd.",
                        });
                    });
                });
            }
            else
            {
                response.json({
                    exito : false,
                    mensaje : "Producto NO eliminado de la bd.",
                });
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