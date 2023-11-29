"use strict";
$(() => {
    $("#btnEnviar").on("click", (e) => {
        e.preventDefault();
        let correo = $("#correo").val();
        let clave = $("#clave").val();
        let dato = {};
        dato.correo = correo;
        dato.clave = clave;
        $.ajax({
            type: "POST",
            url: URL_API + "login",
            dataType: "json",
            data: dato,
            async: true,
        })
            .done(function (obj_ret) {
            console.log(obj_ret);
            let alerta = "";
            if (obj_ret.exito) {
                localStorage.setItem("jwt", obj_ret.jwt);
                alerta = ArmarAlert(obj_ret.mensaje + " redirigiendo al principal.html...");
                setTimeout(() => {
                    $(location).attr("href", "./principal.html");
                }, 2000);
            }
            $("#div_mensaje").html(alerta);
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
            let retorno = JSON.parse(jqXHR.responseText);
            let alerta = ArmarAlert(retorno.mensaje, "danger");
            $("#div_mensaje").html(alerta);
        });
    });
});
//# sourceMappingURL=login.js.map