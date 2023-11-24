"use strict";
$(() => {
    VerificarJWT();
    AdministrarVerificarJWT();
    AdministrarLogout();
    AdministrarListar();
    AdministrarListarJueguetes();
    AdministrarAgregar();
});
function VerificarJWT() {
    let jwt = localStorage.getItem("jwt");
    $.ajax({
        type: 'GET',
        url: URL_API + "login",
        dataType: "json",
        data: {},
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done((obj_rta) => {
        console.log(obj_rta);
        if (obj_rta.exito) {
            $("#divTablaDer").html("VERIFICADO");
            let parcial = obj_rta.jwt.parcial;
            let alumno = obj_rta.jwt.alumno;
            let usuario = obj_rta.jwt.usuario;
            let alerta = ArmarAlert("Parcial: " + JSON.stringify(parcial) + "<br>Alumno: " + JSON.stringify(alumno) + "<br>Usuario: " + JSON.stringify(usuario));
            $("#divTablaDer").html(alerta).toggle(2000);
            $("#rol").html(usuario.Rol);
        }
        else {
            let alerta = ArmarAlert(obj_rta.mensaje, "danger");
            $("#divTablaDer").html(alerta).toggle(2000);
            setTimeout(() => {
                $(location).attr('href', URL_BASE + "login.html");
            }, 1500);
        }
    })
        .fail((jqXHR, textStatus, errorThrown) => {
        let retorno = JSON.parse(jqXHR.responseText);
        let alerta = ArmarAlert(retorno.mensaje, "danger");
        $("#divTablaDer").html(alerta).show(2000);
    });
}
function AdministrarVerificarJWT() {
    $("#verificarJWT").on("click", () => {
        VerificarJWT();
    });
}
function AdministrarLogout() {
    $("#logout").on("click", () => {
        localStorage.removeItem("jwt");
        let alerta = ArmarAlert('Usuario deslogueado!!!');
        $("#divResultado").html(alerta).show(2000);
        setTimeout(() => {
            $(location).attr('href', URL_BASE + "login.html");
        }, 1500);
    });
}
function AdministrarListar() {
    $("#listar_usuarios").on("click", () => {
        ObtenerListadoUsuarios();
    });
}
function AdministrarListarJueguetes() {
    $("#listar_juguetes").on("click", () => {
        ObtenerListadoJuguetes();
    });
}
function AdministrarAgregar() {
    $("#alta_juguete").on("click", () => {
        ArmarFormularioAlta();
    });
}
function ObtenerListadoUsuarios() {
    $("#divTablaDer").html("");
    let jwt = localStorage.getItem("jwt");
    $.ajax({
        type: 'GET',
        url: URL_API + "listarUsuariosBD",
        dataType: "json",
        data: {},
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done((resultado) => {
        console.log(resultado);
        let tabla = ArmarTablaUsuarios(resultado);
        $("#divTablaDer").html(tabla).show(1000);
        $("[data-action='modificar']").on("click", function (e) {
            let objString = $(this).attr("data-obj_prod");
            let obj = JSON.parse(objString);
            let frm = MostrarForm("modificacion", obj);
            $("#cuerpo_modal_prod").html(frm);
        });
        $("[data-action='eliminar']").on("click", function (e) {
            let objString = $(this).attr("data-obj_prod");
            let obj = JSON.parse(objString);
            let frm = MostrarForm("baja", obj);
            $("#cuerpo_modal_prod").html(frm);
        });
    })
        .fail((jqXHR, textStatus, errorThrown) => {
        let retorno = JSON.parse(jqXHR.responseText);
        let alerta = ArmarAlert(retorno.mensaje, "danger");
        $("#divTablaDer").html(alerta).show(2000);
    });
}
function ObtenerListadoJuguetes() {
    $("#divTablaIzq").html("");
    let jwt = localStorage.getItem("jwt");
    $.ajax({
        type: 'GET',
        url: URL_API + "listarJuguetesBD",
        dataType: "json",
        data: {},
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done((resultado) => {
        console.log(resultado);
        let tabla = ArmarTablaJuguetes(resultado);
        $("#divTablaIzq").html(tabla).show(1000);
        $("[data-action='modificar']").on("click", function (e) {
            let objString = $(this).attr("data-obj_prod");
            let obj = JSON.parse(objString);
            let frm = MostrarForm("modificacion", obj);
            $("#cuerpo_modal_prod").html(frm);
        });
        $("[data-action='eliminar']").on("click", function (e) {
            let objString = $(this).attr("data-obj_prod");
            let obj = JSON.parse(objString);
            let frm = MostrarForm("baja", obj);
            $("#cuerpo_modal_prod").html(frm);
        });
    })
        .fail((jqXHR, textStatus, errorThrown) => {
        let retorno = JSON.parse(jqXHR.responseText);
        let alerta = ArmarAlert(retorno.mensaje, "danger");
        $("#divTablaDer").html(alerta).show(2000);
    });
}
function ArmarTablaUsuarios(usuarios) {
    let tabla = '<table class="table table-dark table-hover">';
    tabla += '<tr><th>ID</th><th>Correo</th><th>Clave</th><th>Nombre</th><th>Apellido</th><th>Perfil</th><th>Imagen</th><th>Acciones</th></tr>';
    if (usuarios.length == 0) {
        tabla += '<tr><td>---</td><td>---</td><td>---</td><td>---</td><th>---</td></tr>';
    }
    else {
        usuarios.forEach((usu) => {
            tabla += "<tr>";
            tabla += "<td>" + usu.id + "</td>";
            tabla += "<td>" + usu.correo + "</td>";
            tabla += "<td>" + usu.clave + "</td>";
            tabla += "<td>" + usu.nombre + "</td>";
            tabla += "<td>" + usu.apellido + "</td>";
            tabla += "<td>" + usu.perfil + "</td>";
            tabla += "<td><img src='" + URL_API + usu.foto + "' width='50px' height='50px'></td>";
            tabla += "<td>";
            tabla += "<a href='#' class='btn' data-action='modificar' data-obj_prod='" + JSON.stringify(usu) + "' title='Modificar' " +
                " data-toggle='modal' data-target='#ventana_modal_prod'><span class='fas fa-edit'></span></a>";
            tabla += "<a href='#' class='btn' data-action='eliminar' data-obj_prod='" + JSON.stringify(usu) + "' title='Eliminar' " +
                " data-toggle='modal' data-target='#ventana_modal_prod'><span class='fas fa-times'></span></a>";
            tabla += "</td>";
            tabla += "</tr>";
        });
    }
    tabla += "</table>";
    return tabla;
}
function ArmarTablaJuguetes(juguetes) {
    let tabla = '<table class="table table-dark table-hover">';
    tabla += '<tr><th>ID</th><th>MARCA</th><th>PRECIO</th><th>FOTO<th>ACCIONES</th></tr>';
    if (juguetes.length == 0) {
        tabla += '<tr><td>---</td><td>---</td><td>---</td><td>---</td><th>---</td></tr>';
    }
    else {
        juguetes.forEach((juguete) => {
            tabla += "<tr>";
            tabla += "<td>" + juguete.id + "</td>";
            tabla += "<td>" + juguete.marca + "</td>";
            tabla += "<td>" + juguete.precio + "</td>";
            tabla += "<td><img src='" + URL_API + juguete.path_foto + "' width='50px' height='50px'></td>";
            tabla += "<td>";
            tabla += "<a href='#' class='btn' data-action='modificar' data-obj_prod='" + JSON.stringify(juguete) + "' title='Modificar' " +
                " data-toggle='modal' data-target='#ventana_modal_prod'><span class='fas fa-edit'></span></a>";
            tabla += "<a href='#' class='btn' data-action='eliminar' data-obj_prod='" + JSON.stringify(juguete) + "' title='Eliminar' " +
                " data-toggle='modal' data-target='#ventana_modal_prod'><span class='fas fa-times'></span></a>";
            tabla += "</td>";
            tabla += "</tr>";
        });
    }
    tabla += "</table>";
    return tabla;
}
function ArmarFormularioAlta() {
    $("#divResultado").html("");
    let formulario = MostrarForm("alta");
    $("#cuerpo_modal_prod").html(formulario);
    ((Object)($("#ventana_modal_prod"))).modal({ backdrop: "static" });
}
function MostrarForm(accion, obj_juguete = null) {
    let funcion = "";
    let encabezado = "";
    let solo_lectura = "";
    let solo_lectura_pk = "readonly";
    switch (accion) {
        case "alta":
            funcion = 'Agregar(event)';
            encabezado = 'AGREGAR JUGUETE';
            solo_lectura_pk = "";
            break;
        case "baja":
            funcion = 'Eliminar(event)';
            encabezado = 'ELIMINAR JUGUETE';
            solo_lectura = "readonly";
            break;
        case "modificacion":
            funcion = 'Modificar(event)';
            encabezado = 'MODIFICAR JUGUETE';
            break;
    }
    let id_juguete = "";
    let marca = "";
    let precio = "";
    let foto = URL_BASE + "/img/juguete_default.png";
    if (obj_juguete !== null) {
        id_juguete = obj_juguete.id;
        marca = obj_juguete.marca;
        precio = obj_juguete.precio;
        foto = URL_API + obj_juguete.path_foto;
    }
    let form = '<h3 style="padding-top:1em;">' + encabezado + '</h3>\
                        <div class="row justify-content-center">\
                            <div class="col-md-8">\
                                <form class="was-validated">\
                                <div class="form-group">\
                                <label for="Id">Id:</label>\
                                <input type="text" class="form-control" id="id_juguete" placeholder="Ingresar Id"\
                                    name="marca" value="' + id_juguete + '" ' + solo_lectura + ' required disabled>\
                                <div class="valid-feedback">OK.</div>\
                                <div class="invalid-feedback">Valor requerido.</div>\
                            </div>\
                                    <div class="form-group">\
                                        <label for="marca">Marca:</label>\
                                        <input type="text" class="form-control" id="marca" placeholder="Ingresar marca"\
                                            name="marca" value="' + marca + '" ' + solo_lectura + ' required>\
                                        <div class="valid-feedback">OK.</div>\
                                        <div class="invalid-feedback">Valor requerido.</div>\
                                    </div>\
                                    <div class="form-group">\
                                        <label for="precio">Precio:</label>\
                                        <input type="number" class="form-control" id="precio" placeholder="Ingresar precio" name="precio"\
                                            value="' + precio + '" ' + solo_lectura + ' required>\
                                        <div class="valid-feedback">OK.</div>\
                                        <div class="invalid-feedback">Valor requerido.</div>\
                                    </div>\
                                    <div class="form-group">\
                                        <label for="foto">Foto:</label>\
                                        <input type="file" class="form-control" id="foto" name="foto" ' + solo_lectura + ' required>\
                                        <div class="valid-feedback">OK.</div>\
                                        <div class="invalid-feedback">Valor requerido.</div>\
                                    </div>\
                                    <div class="row justify-content-between"><img id="img_juguete" src="' + foto + '" width="400px" height="200px"></div><br>\
                                    <div class="row justify-content-between">\
                                        <input type="button" class="btn btn-danger" data-dismiss="modal" value="Cerrar">\
                                        <button type="submit" class="btn btn-primary" data-dismiss="modal" onclick="' + funcion + '" >Aceptar</button>\
                                    </div>\
                                </form>\
                            </div>\
                        </div>';
    return form;
}
function Agregar(e) {
    e.preventDefault();
    let jwt = localStorage.getItem("jwt");
    let marca = $("#marca").val();
    let precio = $("#precio").val();
    let foto = $("#foto")[0];
    let frm = new FormData();
    frm.append("juguete_json", JSON.stringify({ "marca": marca, "precio": precio }));
    frm.append("foto", foto.files[0]);
    $.ajax({
        type: 'POST',
        url: URL_API + "agregarJugueteBD",
        dataType: "json",
        data: frm,
        cache: false,
        processData: false,
        contentType: false,
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (obj_ret) {
        console.log(obj_ret);
        let alerta = "";
        alerta = ArmarAlert(obj_ret.mensaje);
        ObtenerListadoJuguetes();
        $("#divResultado").html(alerta);
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        let retorno = JSON.parse(jqXHR.responseText);
        let alerta = ArmarAlert(retorno.mensaje, "danger");
        $("#divResultado").html(alerta);
    });
}
function Modificar(e) {
    e.preventDefault();
    let jwt = localStorage.getItem("jwt");
    let id_juguete = $("#id_juguete").val();
    let marca = $("#marca").val();
    let precio = $("#precio").val();
    let foto = $("#foto")[0];
    let frm = new FormData();
    frm.append("juguete", JSON.stringify({ "id_juguete": id_juguete, "marca": marca, "precio": precio }));
    frm.append("foto", foto.files[0]);
    $.ajax({
        type: 'POST',
        url: URL_API + "toys",
        dataType: "json",
        data: frm,
        cache: false,
        processData: false,
        contentType: false,
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (obj_ret) {
        console.log(obj_ret);
        let alerta = "";
        alerta = ArmarAlert(obj_ret.mensaje);
        ObtenerListadoJuguetes();
        $("#divResultado").html(alerta);
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        let retorno = JSON.parse(jqXHR.responseText);
        let alerta = ArmarAlert(retorno.mensaje, "danger");
        $("#divResultado").html(alerta);
    });
    $("#cuerpo_modal_prod").html("Implementar...");
}
function Eliminar(e) {
    e.preventDefault();
    let id_juguete = $("#id_juguete").val();
    ((Object)($("#cuerpo_modal_prod"))).modal("hide");
    $("#cuerpo_modal_confirm").html('\<h5>¿Está seguro de eliminar el producto ' + id_juguete + '?</h5> \
    <input type="button" class="btn btn-danger" data-dismiss="modal" value="NO" style="float:right;margin-left:5px">\
    <button type="submit" class="btn btn-primary" data-dismiss="modal" onclick="ContinuarEliminar(' + id_juguete + ')" style="float:right">Sí </button>');
    ((Object)($("#ventana_modal_confirm"))).modal({ backdrop: "static" });
    return;
}
function ContinuarEliminar(id) {
    let jwt = localStorage.getItem("jwt");
    $.ajax({
        type: 'DELETE',
        url: URL_API + "toys",
        dataType: "text",
        data: { "id_juguete": id },
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (obj_ret) {
        console.log(obj_ret);
        let alerta = "";
        alerta = ArmarAlert(obj_ret.mensaje);
        ObtenerListadoJuguetes();
        $("#divResultado").html(alerta);
        ObtenerListadoJuguetes();
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        console.error(jqXHR, textStatus, errorThrown);
        let retorno = JSON.parse(jqXHR.responseText);
        let alerta = ArmarAlert(retorno.mensaje, "danger");
        $("#divResultado").html(alerta);
    });
}
//# sourceMappingURL=principal.js.map