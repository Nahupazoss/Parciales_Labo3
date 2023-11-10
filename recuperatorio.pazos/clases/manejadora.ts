/// <reference path="./ajax.ts"/>

namespace RecPrimerParcial
{
    export class Manejadora
    {
        public static MostrarPlantasFotosBD() : void
        {
            let ajax = new Ajax();

            ajax.Get("http://localhost:2023/listarPlantasFotosBD", (resultado:string)=>
            {
                let div = (<HTMLInputElement>document.getElementById("divTablaPlantaFotos"));
                //div.textContent = "";
                console.clear();
                console.log(resultado);

                let plantas = JSON.parse(resultado);

                if(plantas !== null)
                {
                    let tabla = "<table><thead><tr><th>Codigo</th><th>Nombre</th><th>Color</th><th>Precio</th><th>Foto</th><th>Acciones</th></tr></thead><tbody>";

                    for(let planta of plantas)
                    {
                        tabla += '<tr><td>' + planta.codigo + '</td><td>' + planta.nombre + '</td><td>' + `<input = type="color" value=${planta.color_flor} disabled></input>`;
                        tabla += '</td><td>' + planta.precio + '</td><td>' + `<img src="http://localhost:2023/${planta.foto}" width="50px" hight="50px">` + '</td>';  
                        tabla += `<td><input type="button" value="Modificar" class="btn btn-info id="" data-obj=${JSON.stringify(planta)} name="btnModificar"><span class="bi bi-pencil"></span></input></td>`;
                        tabla += `<td><input type="button" value="Eliminar" class="btn btn-danger id="" data-obj='${JSON.stringify(planta)}' name="btnEliminar"><span class="bi bi-x-circle"></span></input></td></tr>`;  
                    }

                    tabla += "</tbody></table>";
                    div.innerHTML = tabla;

                    document.getElementsByName("btnModificar").forEach((boton)=>
                    {
                        boton.addEventListener("click", ()=>
                        {
                            let obj : any = boton.getAttribute("data-obj");
                            new Manejadora().ModificarPlantaFotoBD(obj);
                        });
                    });

                    document.getElementsByName("btnEliminar").forEach((boton)=>
                    {
                        boton.addEventListener("click", ()=>
                        {
                            let obj : any = boton.getAttribute("data-obj");
                            new Manejadora().EliminarPlantaFotoBD(obj);
                        });
                    });
                }
            });
        }

        public static AgregarPlantaFotoBD() : void
        {
            let ajax = new Ajax();
            let codigo = (<HTMLInputElement>document.getElementById("codigo")).value;
            let nombre = (<HTMLInputElement>document.getElementById("nombre")).value;
            let color_flor = (<HTMLInputElement>document.getElementById("color_flor")).value;
            let precio = (<HTMLInputElement>document.getElementById("precio")).value;
            let foto : any = (<HTMLInputElement> document.getElementById("foto"));
            let form = new FormData();

            form.append("codigo", codigo);
            form.append("nombre", nombre);
            form.append("color_flor", color_flor);
            form.append("precio", precio);
            form.append("foto", foto.files[0]);

            ajax.Post("http://localhost:2023/agregarPlantaFotoBD", (resultado:string)=>
            {
                let retParseado = JSON.parse(resultado);
                alert(retParseado.mensaje);
                console.log(retParseado.mensaje);
                (<HTMLInputElement>document.getElementById("codigo")).value = "";
                (<HTMLInputElement>document.getElementById("codigo")).readOnly = false;
                (<HTMLInputElement>document.getElementById("nombre")).value = "";
                (<HTMLInputElement>document.getElementById("color_flor")).value = "";
                (<HTMLInputElement>document.getElementById("precio")).value = "";
                (<HTMLImageElement> document.getElementById("imgFoto")).src = "";
                Manejadora.MostrarPlantasFotosBD();
            }, form, Manejadora.Fail);
        }

        public ModificarPlantaFotoBD(param:string) : void
        {
            let planta = JSON.parse(param);
            (<HTMLInputElement>document.getElementById("codigo")).value = planta.codigo;
            (<HTMLInputElement>document.getElementById("codigo")).readOnly = true;
            (<HTMLInputElement>document.getElementById("nombre")).value = planta.nombre;
            (<HTMLInputElement>document.getElementById("color_flor")).value = planta.color_flor;
            (<HTMLInputElement>document.getElementById("precio")).value = planta.precio;
            (<HTMLImageElement> document.getElementById("imgFoto")).src = "http://localhost:2023/" + planta.foto;
        }

        public EliminarPlantaFotoBD(param:string) : void
        {
            let planta = JSON.parse(param);

            if(confirm(`Seguro de eliminar la planta: ${planta.codigo} - ${planta.nombre}?`))
            {
                let ajax = new Ajax();
                let header = [{"key": "content-type", "value": "application/json"}];
                let params = `{"codigo":"${planta.codigo}"}`;

                ajax.Post("http://localhost:2023/eliminarPlantaFotoBD", (resultado:string)=>
                {
                    let retParseado = JSON.parse(resultado);
                    console.clear();
                    console.log(retParseado.mensaje);
                    alert(retParseado.mensaje);
                    Manejadora.MostrarPlantasFotosBD();
                }, params, Manejadora.Fail, header);
            }   
        }

        public static AsignarModificarPlantaFotoBD()
        {
            let xhttp : XMLHttpRequest = new XMLHttpRequest();
            let codigo : string = ((<HTMLInputElement> document.getElementById("codigo")).value);
            let nombre : string = ((<HTMLInputElement> document.getElementById("nombre")).value);
            let color_flor : string = ((<HTMLInputElement> document.getElementById("color_flor")).value);
            let precio : number = parseFloat(((<HTMLInputElement> document.getElementById("precio")).value));
            let foto : any = (<HTMLInputElement>document.getElementById("foto"));

            if (codigo !="" && nombre !="" && color_flor !="" && precio !=-1 && foto != "") 
            {
                let planta : Pazos.Planta = new Pazos.Planta(codigo,nombre,color_flor,precio);
                
                let formData : FormData = new FormData();

                xhttp.open("POST","http://localhost:2023/modificarPlantaFotoBD");
                formData.append('planta_json', planta.ToJSON());
                formData.append('foto', foto.files[0]);
                xhttp.setRequestHeader("enctype","multipart/form-data");
                xhttp.send(formData);

                xhttp.onreadystatechange = () => 
                {
                    console.log(xhttp.readyState + " - " + xhttp.status);
                    
                    if (xhttp.readyState == 4 && xhttp.status == 200) 
                    {
                        let respuesta = JSON.parse(xhttp.responseText);
                        if (respuesta.exito == true) 
                        {
                            const inputCodigo = document.getElementById("codigo") as HTMLInputElement;
                            Manejadora.MostrarPlantasFotosBD();


                            if (inputCodigo) {
                                inputCodigo.readOnly = false; 
                            }
                        }

                        console.log(xhttp.responseText);
                        alert(xhttp.responseText);
                        alert(planta.ToJSON());//verifico q este bien el JSON//

                    }
                };
            }
            else
            {
                alert("Cargue TODOS los datos");
            }
            
        }


        private static Fail(retorno:string):void 
        {
            console.error(retorno);
            alert("Ha ocurrido un ERROR!!!....");
        }
    }
}