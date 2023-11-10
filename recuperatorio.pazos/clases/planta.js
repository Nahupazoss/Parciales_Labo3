"use strict";
var Pazos;
(function (Pazos) {
    class Planta {
        constructor(codigo, nombre, color_flor, precio, foto) {
            this.codigo = codigo;
            this.nombre = nombre;
            this.color_flor = color_flor;
            this.precio = precio;
            this.foto = foto;
        }
        ToJSON() {
            return `{"codigo":"${this.codigo}","nombre":"${this.nombre}","color_flor":"${this.color_flor}","precio":${this.precio},"foto":${this.foto}}`;
        }
    }
    Pazos.Planta = Planta;
})(Pazos || (Pazos = {}));
//# sourceMappingURL=planta.js.map