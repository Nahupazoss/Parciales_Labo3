"use strict";
/// <reference path="./clases/manejadora.ts"/>
window.addEventListener("load", () => {
    var _a, _b;
    if (window.location.pathname.includes("vivero.html")) {
        RecPrimerParcial.Manejadora.MostrarPlantasFotosBD();
        (_a = document.getElementById("btn-agregar")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", RecPrimerParcial.Manejadora.AgregarPlantaFotoBD);
        (_b = document.getElementById("btn-modificar")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", RecPrimerParcial.Manejadora.AsignarModificarPlantaFotoBD);
        //document.getElementById("btn-filtrar")?.addEventListener("click", RecPrimerParcial.Manejadora);
    }
    else {
    }
});
//# sourceMappingURL=script.js.map