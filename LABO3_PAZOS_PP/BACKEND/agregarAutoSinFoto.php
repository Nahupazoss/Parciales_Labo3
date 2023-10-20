<?php

use PazosNahuel\autoBD;

require_once("./clases/autoBD.php");

$auto_json = isset($_POST['autos_json']) ? $_POST['autos_json'] : null;
$lectura = json_decode($auto_json, true);

if ($lectura) 
{
    $auto =  new autoBD($lectura['marca'], $lectura['patente'], $lectura['color'], $lectura['precio']);

    $obj = new stdClass();
    $obj->exito = false;
    $obj->mensaje = "error";

    if ($auto->agregar()) 
    {
        $obj->exito = true;
        $obj->mensaje = "auto agregado correctamente";
    }

    // Establece el encabezado de respuesta como JSON
    header('Content-Type: application/json');

    // Devuelve la respuesta JSON
    echo json_encode($obj);
} 
else 
{
    // En caso de error en la decodificación JSON, devuelve una respuesta de error
    $obj = new stdClass();
    $obj->exito = false;
    $obj->mensaje = "Error en los datos JSON recibidos";

    // Establece el encabezado de respuesta como JSON
    header('Content-Type: application/json');

    // Devuelve la respuesta JSON de error
    echo json_encode($obj);
}