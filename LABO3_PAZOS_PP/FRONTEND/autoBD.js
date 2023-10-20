"use strict";
var Pazos;
(function (Pazos) {
    class AutoBD extends Pazos.Auto {
        constructor(patente = "", marca = "", color = "", precio = 0, pathFoto = "") {
            super(patente, marca, color, precio);
            this.pathFoto = pathFoto;
        }
        ToJSON() {
            return "{" + super.ToString() + ", " + `"pathFoto":"${this.pathFoto}"}`;
        }
    }
    Pazos.AutoBD = AutoBD;
})(Pazos || (Pazos = {}));
//# sourceMappingURL=autoBD.js.map