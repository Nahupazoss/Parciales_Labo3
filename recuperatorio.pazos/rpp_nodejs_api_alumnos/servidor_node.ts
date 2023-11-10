
const express = require('express');

const app = express();

app.set('puerto', 2023);

//AGREGO FILE SYSTEM
const fs = require('fs');

//AGREGO JSON
app.use(express.json());

//AGREGO MULTER
const multer = require('multer');

//AGREGO MIME-TYPES
const mime = require('mime-types');

//AGREGO STORAGE
const storage = multer.diskStorage({

    destination: "public/autos/fotos/",
});

const upload = multer({

    storage: storage
});

//AGREGO MYSQL y EXPRESS-MYCONNECTION
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'garage_bd'
};

//AGREGO MW 
app.use(myconn(mysql, db_options, 'single'));

//AGREGO CORS (por default aplica a http://localhost)
const cors = require("cors");

//AGREGO MW 
app.use(cors());

//DIRECTORIO DE ARCHIVOS ESTÁTICOS
app.use(express.static("public"));

//##############################################################################################//
//RUTAS PARA EL CRUD - CON BD - AUTOS
//##############################################################################################//

//AGREGAR BD
app.post('/agregarAutoBD', (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        let obj = (request.body);

        let obj_rta:any={};
        obj_rta.exito = true;
        obj_rta.mensaje = "Auto agregado en BD";

        if(err){

            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {

            conn.query("insert into autos set ?", [obj], (err:any, rows:any)=>{

                if(err) { 

                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error en consulta de base de datos.";
                }

            });
        }

        response.send(JSON.stringify(obj_rta));
    });
});

//LISTAR BD
app.get('/listarAutosBD', (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select patente, marca, color, precio from autos", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            response.send(JSON.stringify(rows));
        });
    });

});

//MODIFICAR BD
app.post('/modificarAutoBD', (request:any, response:any)=>{

    let obj = request.body;

    let obj_rta:any={};
    obj_rta.exito = true;
    obj_rta.mensaje = "Auto modificado en BD";

    request.getConnection((err:any, conn:any)=>{

        if(err){

            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {

            conn.query("update autos set ? where patente = ?", [obj, obj.patente], (err:any, rows:any)=>{

                if(err) { 

                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error en consulta de base de datos.";
                }
            });
        }

        response.send(JSON.stringify(obj_rta));
    });
});

//ELIMINAR BD
app.post('/eliminarAutoBD', (request:any, response:any)=>{

    let obj = request.body;

    let obj_rta:any={};
    obj_rta.exito = true;
    obj_rta.mensaje = "Auto eliminado en BD";

    request.getConnection((err:any, conn:any)=>{

        if(err){

            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {

            conn.query("delete from Autos where patente = ?", [obj.patente], (err:any, rows:any)=>{

                if(err) { 

                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error en consulta de base de datos.";
                }
            });
        }

        response.send(JSON.stringify(obj_rta));
    });
});

//##############################################################################################//
//RUTAS PARA EL CRUD - CON BD - AUTOS con FOTO
//##############################################################################################//

//LISTAR BD - autos con foto
app.get('/listarAutoFotosBD', (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select patente, marca, color, precio, foto from autos", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            response.send(JSON.stringify(rows));
        });
    });

});

//AGREGAR BD - Auto con foto
app.post('/agregarAutoFotoBD', upload.single("foto"), (request:any, response:any)=>{
   
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = request.body;
    let path : string = file.destination + obj.patente + "." + extension;

    fs.renameSync(file.path, path);

    obj.foto = path.split("public/")[1];

    let obj_rta:any={};
    obj_rta.exito = true;
    obj_rta.mensaje = "Auto con foto agregado en BD";

    request.getConnection((err:any, conn:any)=>{

        if(err){

            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {

            conn.query("insert into autos set ?", [obj], (err:any, rows:any)=>{

                if(err) { 

                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error en consulta de base de datos.";
                }
            });
        }
    });

    response.send(JSON.stringify(obj_rta));
});

//MODIFICAR BD - Auto con foto
app.post('/modificarAutoFotoBD', upload.single("foto"), (request:any, response:any)=>{
    
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.autoFoto_json);
    let path : string = file.destination + obj.patente + "." + extension;

    fs.renameSync(file.path, path);

    let obj_modif : any = {};
    //para excluir la pk (patente)
    obj_modif.marca = obj.marca;
    obj_modif.color = obj.color;
    obj_modif.precio = obj.precio;
    obj_modif.foto = path.split("public/")[1];

    let obj_rta:any={};
    obj_rta.exito = true;
    obj_rta.mensaje = "Auto con foto modificado en BD";

    request.getConnection((err:any, conn:any)=>{

        if(err){

            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {

            conn.query("update autos set ? where patente = ?", [obj_modif, obj.patente], (err:any, rows:any)=>{

                if(err) { 

                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error en consulta de base de datos.";
                }
            });
        }

        response.send(JSON.stringify(obj_rta));
    });
});

//ELIMINAR BD - Auto con foto
app.post('/eliminarAutoFotoBD', (request:any, response:any)=>{
   
    let obj = request.body;
    let path_foto : string = "public/";

    let obj_rta:any={};
    obj_rta.exito = true;
    obj_rta.mensaje = "Auto con foto eliminado en BD";

    request.getConnection((err:any, conn:any)=>{

        if(err){

            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {

            //obtengo el path de la foto del producto a ser eliminado
            conn.query("select foto from autos where patente = ?", [obj.patente], (err:any, result:any)=>{

                if(err){

                    obj_rta.exito = false;
                    obj_rta.mensaje = "Error al conectarse a la base de datos.";
                }
                else {

                    path_foto += result[0].foto;
                }
            });
        }
    });

    request.getConnection((err:any, conn:any)=>{

        if(err){

            obj_rta.exito = false;
            obj_rta.mensaje = "Error al conectarse a la base de datos.";
        }
        else {

            conn.query("delete from autos where patente = ?", [obj.patente], (err:any, rows:any)=>{

                fs.unlink(path_foto, (err:any) => {
                    if(err){

                        obj_rta.exito = false;
                        obj_rta.mensaje = "Error al eliminar foto.";
                    }
                });

            });
        }

        response.send(JSON.stringify(obj_rta));
    });
});



app.listen(app.get('puerto'), ()=>{
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});