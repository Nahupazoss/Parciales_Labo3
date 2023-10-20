"use strict";
var Pazos;
(function (Pazos) {
    class AutoFoto extends Pazos.Auto {
        constructor(marca, patente, color, precio, foto) {
            super(marca, patente, color, precio);
            this.foto = foto;
        }
    }
    Pazos.AutoFoto = AutoFoto;
})(Pazos || (Pazos = {}));
//# sourceMappingURL=autoFoto.js.map