/// <reference path="./auto.ts" />
/// <reference path="./autoBD.ts" />
/// <reference path="./Iparte2.ts" />
/// <reference path="./Iparte3.ts" />

let xhttp: XMLHttpRequest = new XMLHttpRequest();

namespace PrimerParcial 
{

    export class Manejadora implements Iparte2, Iparte3
    {

      // AgregarAutoJSON. Obtiene la patente, la marca , el color y el precio desde la página auto.html y se
      // enviará (por AJAX) hacia “./BACKEND/altaAutoJSON.php” que invoca al método guardarJSON y se pasa
      // './archivos/autos.json' cómo parámetro. Retornará un JSON que contendrá: éxito(bool) y mensaje(string) indicando lo
      // acontecido.
      // Informar por consola y alert el mensaje recibido.
        public static AgregarAutoJSON() 
        {
            let marca = (<HTMLInputElement>document.getElementById("marca")).value;
            let patente = (<HTMLInputElement>document.getElementById("patente")).value;
            let color = (<HTMLInputElement>document.getElementById("color")).value;
            let precio = (<HTMLInputElement>document.getElementById("precio")).value;

            xhttp.open("POST", "./BACKEND/altaAutoJSON.php", true);

            let form: FormData = new FormData();

            form.append("marca", marca);
            form.append("patente", patente);
            form.append("color", color);
            form.append("precio", precio);

            xhttp.send(form);

            xhttp.onreadystatechange = () => 
            {
                if (xhttp.readyState == 4 && xhttp.status == 200) 
                {
                    let respuesta = JSON.parse(xhttp.responseText);
                    console.log(respuesta.mensaje);
                    alert(respuesta.mensaje);
                }
            };
    }

    // MostrarAutoJSON. Recuperará (por AJAX) todos los autos del archivo autos.json y
    // generará un listado dinámico, crear una tabla HTML con cabecera (en el FRONTEND) que mostrará toda la
    // información de cada uno de los neumáticos. Invocar a “./BACKEND/listadoAutossJSON.php”, recibe la
    // petición (por GET) y retornará el listado de todos los neumáticos en formato JSON.
    // Informar por consola el mensaje recibido y mostrar el listado en la página (div id='divTabla').
  
    public static MostrarAutoJSON() 
    {
        xhttp.open("GET", "./BACKEND/listadoAutosJSON.php", true);
        xhttp.onreadystatechange = () => 
        {
            if (xhttp.readyState == 4 && xhttp.status == 200) 
            {
                let respuesta: string = xhttp.responseText;
                let autosJson = JSON.parse(respuesta);
                console.log(autosJson);

                const contenerdorTabla: HTMLDivElement = <HTMLDivElement>document.getElementById("divTabla");
                contenerdorTabla.innerHTML = "";

                // ARMADO DE TABLA
                const tabla: HTMLTableElement = document.createElement("table");

                // Armado de thead
                const thead = document.createElement("thead");

                for (const key in autosJson[0]) 
                {
                    const th = document.createElement("th");
                    let text = document.createTextNode(key.toUpperCase());
                    th.appendChild(text);
                    thead.appendChild(th);
                }
                //Armado de tbody
                const tbody = document.createElement("tbody");
                autosJson.forEach((auto: any) => 
                {
                    const tr = document.createElement("tr");
            
                    for (const key in auto) 
                    {
                        const td = document.createElement("td");
                        let text = document.createTextNode(auto[key]);
                        td.appendChild(text);
                        tr.appendChild(td);
                    }

                    tbody.appendChild(tr);
                });

                tabla.appendChild(thead);
                tabla.appendChild(tbody);
                contenerdorTabla.appendChild(tabla); // se inyecta toda la tabla en el contenedor
            }
        };

        xhttp.send();
    }

    // VerificarAutoJSON. Se invocará (por AJAX) a “./BACKEND/verificarAutoJSON.php”. Se recibe por
    // POST  la patente y retornará un JSON que contendrá: éxito(bool) y mensaje(string) indicando lo acontecido (agregar, aquí
    // también, el mensaje obtenido del método VerificarNeumaticoJSON).
    // Se mostrará (por consola y alert) lo acontecido.

    public static VerificarAutoJSON() 
    {

        let patente: string = (<HTMLInputElement>document.getElementById("patente")).value;

        xhttp.open("POST", "./BACKEND/verificarAutoJSON.php", true);

        let form: FormData = new FormData();

        form.append("patente", patente);

        xhttp.send(form);

        xhttp.onreadystatechange = () => 
        {
            if (xhttp.readyState == 4 && xhttp.status == 200) 
            {
                let respuesta = JSON.parse(xhttp.responseText);
                console.log(respuesta.mensaje);
                alert(respuesta.mensaje);
            }
          };

    }

    // AgregarAutoSinFoto. Obtiene la patente, la marca , el color y el precio desde la página auto.html, y se
    // enviará (por AJAX) hacia “./BACKEND/agregarAutoSinFoto.php” que recibe por POST el parámetro
    // auto_json (patente, marca, color y precio), en formato de cadena JSON. Se invocará al método agregar.
    // Se retornará un JSON que contendrá: éxito(bool) y mensaje(string) indicando lo acontecido.
    // Informar por consola y alert el mensaje recibido.

    public static AgregarAutoSinFoto() 
    {
        let marca = (<HTMLInputElement>document.getElementById("marca")).value;
        let patente = (<HTMLInputElement>document.getElementById("patente")).value;
        let color = (<HTMLInputElement>document.getElementById("color")).value;
        let precio = (<HTMLInputElement>document.getElementById("precio")).value;

        let auto = new Pazos.Auto(marca, patente, color,parseInt(precio));

        xhttp.open("POST", "./BACKEND/agregarAutoSinFoto.php", true);

        let form: FormData = new FormData();

        form.append("autos_json", auto.ToJSON());

        xhttp.send(form);

        xhttp.onreadystatechange = () => 
        {
            if (xhttp.readyState == 4 && xhttp.status == 200) 
            {
                let respuesta = JSON.parse(xhttp.responseText);
                console.log(respuesta.mensaje);
                alert(respuesta.mensaje);
            }
        };

    }

    // MostrarAutoBD. Recuperará (por AJAX) todas los autos de la base de datos, invocando a
    // “./BACKEND/listadoAutosBD.php”, que recibirá el parámetro tabla con valor distinto a 'mostrar', para que retorne un
    // array de objetos con formato JSON.
    // Crear una tabla HTML con cabecera (en el FRONTEND) para mostrar la información de cada uno de los
    // neumáticos. Preparar la tabla para que muestre la imagen, si es que la tiene. Todas las imágenes deben tener
    // 50px por 50px de dimensiones.
    // Informar por consola el mensaje recibido y mostrar el listado en la página (div id='divTabla').

    public static MostrarAutoBD(tipoTabla: number) 
    {
        xhttp.open("GET", "./BACKEND/ListadoAutosBD.php", true);

        xhttp.onreadystatechange = () => 
        {
            if (xhttp.readyState == 4 && xhttp.status == 200) 
            {
                let respuesta: string = xhttp.responseText;
                let autosJson = JSON.parse(respuesta);
                console.log(autosJson);
  
                const contenerdorTabla: HTMLDivElement = <HTMLDivElement>document.getElementById("divTabla");
                contenerdorTabla.innerHTML = "";
  
                let tablaStr: string = `
                <table>
                    <thead>`;
                for (const key in autosJson[0]) 
                {
                    tablaStr += `<th>${key.toLocaleUpperCase()}</th>`;
                }
                tablaStr += `<th>ACCIONES</th>`;
                tablaStr += `</thead>`;
  
                tablaStr += `<tbody>`;
                autosJson.forEach((auto: any) => 
                {
                    tablaStr += `<tr>`;
                    for (const key in auto) 
                    {
                        if (key != "pathFoto") 
                        {
                            tablaStr += `<td>${auto[key]}</td>`;
                        } 
                        else 
                        {
                            tablaStr += `<td><img src='./BACKEND${auto[key]}' width='50px' alt='img'></td>`;
                        }
                    }
  
                    let autoStr = JSON.stringify(auto);
                    if (tipoTabla == 1) 
                    {
                        tablaStr += `<td> <input type="button" value="Modificar" class="btn btn-info" onclick=PrimerParcial.Manejadora.BtnModificarAuto(${autoStr})></td>`;
                        tablaStr += `<td> <input type="button" value="Eliminar" class="btn btn-danger" onclick=PrimerParcial.Manejadora.EliminarAuto(${autoStr})></td>`;
                    } 
                    else if (tipoTabla == 2) 
                    {
                        tablaStr += `<td> <input type="button" value="Modificar" class="btn btn-info" onclick=PrimerParcial.Manejadora.BtnModificarAutoBDFoto(${autoStr})></td>`;
                        tablaStr += `<td> <input type="button" value="Eliminar" class="btn btn-danger" onclick=PrimerParcial.Manejadora.BorrarAutoBDFoto(${autoStr})></td>`;
                    }
                    tablaStr += `</tr>`;
                });
  
                tablaStr += `</tbody>`;
                tablaStr += `</table>`;

                contenerdorTabla.innerHTML = tablaStr;
            }
        };
      xhttp.send();
      
    }
  

  // IMPLEMENTACION INTERFACE IPARTE2
  
  // EliminarAuto. Recibe como parámetro al objeto JSON que se ha de eliminar. Pedir confirmación,
  // mostrando la marca y las medidas, antes de eliminar.
  // Si se confirma se invocará (por AJAX) a “./BACKEND/eliminarAutoBD.php” pasándole cómo parámetro
  // auto_json (id, marca, medidas y precio, en formato de cadena JSON) por POST y se deberá borrar el neumático de la base de
  // datos (invocando al método eliminar).
  // Si se pudo borrar en la base de datos, invocar al método guardarJSON y pasarle './BACKEND/archivos/autos_eliminados.json'
  // cómo parámetro.
  // Retornar un JSON que contendrá: éxito(bool) y mensaje(string) indicando lo acontecido.
  // Informar por consola y alert lo acontecido. Refrescar el listado para visualizar los cambios.

    EliminarAuto(obj: any) :void {}

    static EliminarAuto(auto: AutoData) {
        const confirmacion = confirm(`Desea eliminar el auto con ID ${auto.id}?`);
        if (confirmacion) {
            xhttp.open("POST", "./BACKEND/eliminarAutoBD.php", true);
            xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            xhttp.onreadystatechange = () => {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    const respuesta = JSON.parse(xhttp.responseText);
                    console.log(respuesta.mensaje);
                    alert(respuesta.mensaje);
                    Manejadora.MostrarAutoBD(1); // Refrescar el listado
                }
            };

            // Envía el parámetro como auto_json
            xhttp.send(`auto_json=${JSON.stringify(auto)}`);
        }
    }



    // ModificarAuto. Mostrará todos los datos del neumático que recibe por parámetro (objeto JSON), en el
    // formulario, de tener foto, incluirla en “imgFoto”. Permitirá modificar cualquier campo, a excepción del id.
    // Al pulsar el botón Modificar sin foto (de la página) se invocará (por AJAX) a
    // “./BACKEND/modificarAutoBD.php” Se recibirán por POST los siguientes valores: neumatico_json (id, marca,
    // medidas, y precio, en formato de cadena JSON) para modificar un neumático en la base de datos. Invocar al método modificar.
    // Nota: El valor del id, será el id del neumático 'original', mientras que el resto de los valores serán los del neumático a ser modificado.
    // Se retornará un JSON que contendrá: éxito(bool) y mensaje(string) indicando lo acontecido.
    // Refrescar el listado solo si se pudo modificar, caso contrario, informar (por alert y consola) de lo acontecido.

    ModificarAuto(): void {}

    public static ModificarAutoBDSinFoto(): void 
    {
        const inpId = <HTMLInputElement>document.getElementById("idAuto");
        const inpMarca = <HTMLInputElement>document.getElementById("marca");
        const inpPatente = <HTMLInputElement>document.getElementById("patente");
        const inpColor = <HTMLInputElement>document.getElementById("color");
        const inpPrecio = <HTMLInputElement>document.getElementById("precio");
      
        let id: number = parseInt(inpId.value);
        let marca: string = inpMarca.value;
        let patente: string = inpPatente.value;
        let color: string = inpColor.value;
        let precio: number = parseFloat(inpPrecio.value);
      
        const Auto = 
        {
          id: id,
          marca: marca,
          patente: patente,
          color: color,
          precio: precio,
        };
      
        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", "./BACKEND/modificarAutoBD.php", true);
      
        let form: FormData = new FormData();
        form.append("autos_json", JSON.stringify(Auto));
      
        xhttp.send(form);
      
        xhttp.onreadystatechange = () => 
        {
          if (xhttp.readyState == 4 && xhttp.status == 200) 
          {
            let respuesta = JSON.parse(xhttp.responseText);
      
            if (respuesta.exito) 
            {
              // La modificación se realizó con éxito. Puedes mostrar un mensaje o actualizar la lista de autos.
              Manejadora.MostrarAutoBD(1);
            }
      
            console.log(respuesta.mensaje);
            alert(respuesta.mensaje);
      
            inpId.value = "";
            inpMarca.value = "";
            inpPatente.value = "";
            inpColor.value = "";
            inpPrecio.value = "";
          }
        };
      }
      

    public static ModificarObjetoEnServidor(objetoActualizado: any): void 
    {
        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", "./BACKEND/modificarObjeto.php", true); // Ajusta la URL y el método según tu servidor
        
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        const formData = new FormData();
        formData.append("objeto_json", JSON.stringify(objetoActualizado)); // Envía el objeto actualizado como JSON
        
        xhttp.onreadystatechange = () => 
        {
            if (xhttp.readyState === 4) 
            {
                if (xhttp.status === 200) 
                {
                    const respuesta = JSON.parse(xhttp.responseText);
                    if (respuesta.exito) 
                    {
                        // La actualización en el servidor fue exitosa, puedes mostrar un mensaje de éxito aquí
                    } 
                    else 
                    {
                        // La actualización en el servidor falló, muestra un mensaje de error
                        console.error(respuesta.mensaje);
                        alert(respuesta.mensaje);
                    }
                } else {
                    // Ocurrió un error en la solicitud AJAX
                    console.error("Error en la solicitud AJAX");
                }
            }
        };
    
        xhttp.send(formData);
    }
    

    public static BtnModificarAuto(obj: any): void 
    {
        // Rellenar el formulario con los valores del objeto
        (<HTMLInputElement>document.getElementById("idAuto")).value = obj.id;
        (<HTMLInputElement>document.getElementById("marca")).value = obj.marca;
        (<HTMLInputElement>document.getElementById("patente")).value = obj.patente;
        (<HTMLInputElement>document.getElementById("color")).value = obj.color;
        (<HTMLInputElement>document.getElementById("precio")).value = obj.precio;
        const img = <HTMLImageElement>document.getElementById("imgFoto");
        
        if (img) 
        {
            img.src = "./BACKEND" + obj.pathFoto;
        }
    
        // Agregar un evento al botón de "Guardar cambios"
        const btnGuardarCambios = document.getElementById("btnGuardarCambios");

        if (btnGuardarCambios) 
        {
            btnGuardarCambios.addEventListener("click", () => 
            {
                // Capturar los valores del formulario
                const id = (<HTMLInputElement>document.getElementById("idAuto")).value;
                const marca = (<HTMLInputElement>document.getElementById("marca")).value;
                const patente = (<HTMLInputElement>document.getElementById("patente")).value;
                const color = (<HTMLInputElement>document.getElementById("color")).value;
                const precio = (<HTMLInputElement>document.getElementById("precio")).value;
    
                // Crear un objeto con los valores capturados
                const objetoActualizado = 
                {
                    id: id,
                    marca: marca,
                    patente: patente,
                    color: color,
                    precio: precio
                };
    
                // Realizar una solicitud AJAX para actualizar el objeto en el servidor
                Manejadora.ModificarObjetoEnServidor(objetoActualizado); // Debes crear esta función
    
                // Puedes mostrar un mensaje de éxito o error aquí después de la respuesta del servidor
            });
        }
    }
    

      // // IMPLEMETACION INTERFACE IPARTE3

      // VerificarAutoBD. Se recupera la marca y la patente del auto desde la página auto_BD.html
      // y se invoca (por AJAX) a “./BACKEND/verificarAutoBD.php” que recibe por POST el parámetro obj_auto,
      // que será una cadena JSON (marca y medidas), si coincide con algún registro de la base de datos (invocar al método traer) retornará
      // los datos del objeto (invocar al toJSON). Caso contrario, un JSON vacío ({}).
      // Informar por consola lo acontecido y mostrar el objeto recibido en la página (div id='divInfo').

    VerificarAutoBD() :void { }

    public static VerificarAutoBD(): void 
    {
        let patente: string = (<HTMLInputElement>document.getElementById("patente")).value;
        let auto = new Pazos.AutoBD(patente);
        xhttp.open("POST", "./BACKEND/verificarAutoBD.php", true);
        let form: FormData = new FormData();
        form.append("patente", auto.ToJSON());
        xhttp.send(form);
        xhttp.onreadystatechange = () => 
        {
            if (xhttp.readyState == 4 && xhttp.status == 200) 
            {
                let respuesta = JSON.parse(xhttp.responseText);
                const contenedorInfo: HTMLDivElement = <HTMLDivElement>document.getElementById("divInfo");
                contenedorInfo.innerText = respuesta.mensaje;
                console.log(respuesta);
            }
        }
    }
    
  
//     AgregarAutoFoto. Obtiene la marca, las patente, el color, el precio y la foto desde la página auto_BD.html
// y se enviará (por AJAX) hacia “./BACKEND/agregarAutoBD.php” que recibirá por POST, la marca, las medidas, el
// precio y la foto para registrar un neumático en la base de datos.
// Verificar la previa existencia del neumático invocando al método existe.
// Se le pasará como parámetro el array que retorna el método traer. Si el neumático ya existe en la base de datos, se retornará un
// mensaje que indique lo acontecido. Si el neumático no existe, se invocará al método agregar. La imagen se guardará en
// “./neumaticos/imagenes/”, con el nombre formado por el marca punto hora, minutos y segundos del alta (Ejemplo:
// pirelli.105905.jpg).
// Se retornará un JSON que contendrá: éxito(bool) y mensaje(string) indicando lo acontecido.
// Informar por consola y alert el mensaje recibido. Refrescar el listado de neumáticos reutilizando el método
// MostrarNeumaticosBD.
    AgregarAutoBDFoto(): void {}

    public static AgregarAutoBDFoto(): void 
    {
        let marca: string = (<HTMLInputElement>document.getElementById("marca")).value;
        let patente: string = (<HTMLInputElement>document.getElementById("patente")).value;
        let color: string = (<HTMLInputElement>document.getElementById("color")).value;
        let precio: string = (<HTMLInputElement>document.getElementById("precio")).value;
        let foto: any = (<HTMLInputElement>document.getElementById("foto"));
    
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", "./BACKEND/AgregarAutoBD.php", true);
    
        let form: FormData = new FormData();
        form.append("marca", marca);
        form.append("patente", patente);
        form.append("color", color);
        form.append("precio", precio);
        form.append("foto", foto.files[0]);
    
        xhttp.send(form);
    
        xhttp.onreadystatechange = () => 
        {
            if (xhttp.readyState == 4) 
            {
                if (xhttp.status == 200) 
                {
                    let respuesta = JSON.parse(xhttp.responseText);
                    console.log(respuesta.mensaje);
                    alert(respuesta.mensaje);
                    Manejadora.MostrarAutoBD(2);
                } 
                else 
                {
                    console.error("Error en la solicitud AJAX");
                }
            }
        };
    }

      // BorrarAutoFoto. Recibe como parámetro al objeto JSON que se ha de eliminar. Pedir confirmación,
      // mostrando marca y medidas, antes de eliminar.
      // Si se confirma se invocará (por AJAX) a “./BACKEND/eliminarAutoBDFoto.php” que recibe el parámetro
      // autos_json (id, marca, patente, color,precio y pathFoto en formato de cadena JSON) por POST. Se deberá borrar el auto
      // (invocando al método eliminar). Si se pudo borrar en la base de datos, invocar al método guardarEnArchivo.
      // Retornar un JSON que contendrá: éxito(bool) y mensaje(string) indicando lo acontecido.
      // Informar por consola y alert lo acontecido. Refrescar el listado para visualizar los cambios.

    BorrarAutoBDFoto(obj: any) :void {}
  
    public static BorrarAutoBDFoto(obj: any): void 
    {
        let confirmacion = confirm(`Esta seguro de eliminar al auto, marca: ${obj.marca} y patente: ${obj.patente} ?`);

        if (confirmacion) 
        {
          xhttp.open("POST", "./BACKEND/eliminarAutoBDFoto.php", true);
  
          let form: FormData = new FormData();

          form.append("autos_json", JSON.stringify(obj));

          xhttp.send(form);
  
          xhttp.onreadystatechange = () => 
          {
            if (xhttp.readyState == 4 && xhttp.status == 200) 
            {
              let respuesta = JSON.parse(xhttp.responseText);
              console.log(respuesta.mensaje);
              alert(respuesta.mensaje);
              Manejadora.MostrarAutoBD(2);
            }
          };
        }
    }

      // ModificarAutoBDFoto. Mostrará todos los datos del neumático que recibe por parámetro (objeto JSON),
      // en el formulario, de tener foto, incluirla en “imgFoto”. Permitirá modificar cualquier campo (incluyendo la
      // foto), a excepción del id.
      // Al pulsar el botón Modificar (de la página) se invocará (por AJAX) a
      // “./BACKEND/modificarAutoBDFoto.php” dónde se recibirán por POST los siguientes valores: autos_json (id,
      // marca, medidas y precio, en formato de cadena JSON) y la foto (para modificar un neumático en la base de datos). Invocar al método
      // modificar.
      // Nota: El valor del id, será el id del neumático 'original', mientras que el resto de los valores serán los del neumático a ser modificado.
      // Si se pudo modificar en la base de datos, la foto original del registro modificado se moverá al subdirectorio
      // “./neumaticosModificados/”, con el nombre formado por el id punto marca punto 'modificado' punto hora, minutos y segundos de la
      
      // modificación (Ejemplo: 987.fateo.modificado.105905.jpg). Se retornará un JSON que contendrá: éxito(bool) y mensaje(string)
      // indicando lo acontecido.
      // Refrescar el listado solo si se pudo modificar, caso contrario, informar (por alert y consola) de lo acontecido.
      
    ModificarAutoBDFoto() :void {}

    public static ModificarAutoBDFoto(): void 
    {

        const inpId = <HTMLInputElement>document.getElementById("idNeumatico");
        const inpMarca = <HTMLInputElement>document.getElementById("marca");
        const inpPatente = <HTMLInputElement>document.getElementById("patente");
        const inpColor = <HTMLInputElement>document.getElementById("color");
        const inpPrecio = <HTMLInputElement>document.getElementById("precio");
        const inpFoto = <HTMLImageElement>document.getElementById("imgFoto");
        let foto: any = <HTMLInputElement>document.getElementById("foto");
  
        let id: number = parseInt(inpId.value);
        let marca: string = inpMarca.value;
        let patente: string = inpPatente.value;
        let color: string = inpColor.value;
        let precio: number = parseInt(inpPrecio.value);

        const AutoBD = 
        {
          id: id,
          marca: marca,
          patente: patente,
          color: color,
          precio: precio,
        };
  
        xhttp.open("POST", "./BACKEND/modificarAutoBDFoto.php", true);
  
        let form: FormData = new FormData();

        form.append("autos_json", JSON.stringify(AutoBD));

        form.append("foto", foto.files[0]);

        xhttp.setRequestHeader("enctype", "multipart/form-data");

        xhttp.send(form);
  
        xhttp.onreadystatechange = () => 
        {
          if (xhttp.readyState == 4 && xhttp.status == 200) 
          {
            let respuesta = JSON.parse(xhttp.responseText);
            if (respuesta.exito) 
            {
              Manejadora.MostrarAutoBD(2);
            } 
            else 
            {
              console.log(respuesta.mensaje);
              alert(respuesta.mensaje);
            }
            inpId.value = "";
            inpMarca.value = "";
            inpPatente.value = "";
            inpColor.value = "";
            inpPrecio.value = "";
            inpFoto.innerText = "";
            //inpFoto.src = "./";
          }
        };
    }
  
    public static BtnModificarAutoBDFoto(obj: any): void 
    {
        (<HTMLInputElement>document.getElementById("idAuto")).value = obj.id;
        (<HTMLInputElement>document.getElementById("marca")).value = obj.marca;
        (<HTMLInputElement>document.getElementById("patente")).value = obj.patente;
        (<HTMLInputElement>document.getElementById("color")).value = obj.color;
        (<HTMLInputElement>document.getElementById("precio")).value = obj.precio;
        const img = <HTMLImageElement>document.getElementById("imgFoto");
        img.src = "./BACKEND" + obj.pathFoto;
    }

    //MostrarBorradosJSON2() : void {}

    /*public static MostrarBorradosJSON() 
    {
        xhttp.open("GET", "./BACKEND/MostrarBorradosJSON.php", true);

        xhttp.onreadystatechange = () => 
        {
          if (xhttp.readyState == 4 && xhttp.status == 200) 
          {
            let respuesta: string = xhttp.responseText;
            let autosJSON = JSON.parse(respuesta);

            const contenerdorInfo: HTMLDivElement = <HTMLDivElement>document.getElementById("divInfo");
            contenerdorInfo.innerHTML ="<h4>BORRADOS</h4>" + respuesta;
            console.log(autosJSON);
          }
        };
        
        xhttp.send();
    }*/

    //MostrarFotosModificados2() : void {}

    /*public static MostrarFotosModificados() 
    {

        xhttp.open("GET", "./BACKEND/MostrarFotosDeModificados.php", true);

        xhttp.onreadystatechange = () =>
        {
          if (xhttp.readyState == 4 && xhttp.status == 200) 
          {
            let respuesta: string = xhttp.responseText;
            const contenerdorInfo: HTMLDivElement = <HTMLDivElement>document.getElementById("divTabla");
            contenerdorInfo.innerHTML = "<h4>MODIFICADAS</h4>" + respuesta;
          }
        };

        xhttp.send();
    }*/

}
}