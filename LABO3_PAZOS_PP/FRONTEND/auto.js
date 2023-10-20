"use strict";
var Pazos;
(function (Pazos) {
    class Auto {
        constructor(marca, patente, color, precio) {
            this.marca = marca;
            this.patente = patente;
            this.color = color;
            this.precio = precio;
        }
        ToString() {
            return `"patente":"${this.patente}", "marca":"${this.marca}", "color":"${this.color}", "precio":${this.precio}`;
        }
        ToJSON() {
            return "{" + this.ToString() + "}";
        }
    }
    Pazos.Auto = Auto;
})(Pazos || (Pazos = {}));
//# sourceMappingURL=auto.js.map