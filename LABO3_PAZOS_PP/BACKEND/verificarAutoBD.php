<?php

use PazosNahuel\autoBD;

require_once("./clases/autoBD.php");

$auto_JSON = isset($_POST['obj_auto']) ? $_POST['obj_auto'] : null;

$lectura = json_decode($auto_JSON, true);

$patente = isset($lectura['patente']) ? $lectura['patente'] : '';

$response = array(); // Crear un array para la respuesta

if (autoBD::existe($patente)) 
{
    $response['mensaje'] = "Existe.";
} 
else 
{
    $response['mensaje'] = "No existe.";
}

// Usar json_encode para convertir el array en una cadena JSON
echo json_encode($response);
