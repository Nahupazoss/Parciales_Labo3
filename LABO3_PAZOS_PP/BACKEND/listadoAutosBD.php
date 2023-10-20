<?php

use PazosNahuel\autoBD;

require_once 'clases/autoBD.php';

$autos = autoBD::traer();

// Crear un array para almacenar los autos
$autosArray = array();

foreach ($autos as $auto) {
    $autoInfo = array(
        "marca" => $auto->marca,
        "patente" => $auto->patente,
        "color" => $auto->color,
        "precio" => $auto->precio,
        "pathFoto" => $auto->pathFoto
    );

    // Agregar el auto al array
    array_push($autosArray, $autoInfo);
}

// Establecer el encabezado de respuesta como JSON
header('Content-Type: application/json');

// Devolver la respuesta JSON
echo json_encode($autosArray);
?>