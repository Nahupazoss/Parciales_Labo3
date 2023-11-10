/// <reference path="./clases/manejadora.ts"/>

window.addEventListener("load", ()=>
{
    if(window.location.pathname.includes("vivero.html"))
    {

        RecPrimerParcial.Manejadora.MostrarPlantasFotosBD();
        document.getElementById("btn-agregar")?.addEventListener("click", RecPrimerParcial.Manejadora.AgregarPlantaFotoBD);
        document.getElementById("btn-modificar")?.addEventListener("click", RecPrimerParcial.Manejadora.AsignarModificarPlantaFotoBD);
        //document.getElementById("btn-filtrar")?.addEventListener("click", RecPrimerParcial.Manejadora);
    }
    else
    {

    }
 
});