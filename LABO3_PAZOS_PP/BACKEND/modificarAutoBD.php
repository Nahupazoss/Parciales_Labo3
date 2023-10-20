<?php
use PazosNahuel\autoBD;

header("Content-Type: application/json"); // Establece el encabezado para indicar que la respuesta será JSON

require_once 'clases/autoBD.php';

$obj = json_decode($_POST['auto_json']);

$newauto = new autoBD($obj->marca, $obj->patente, $obj->color, $obj->precio, "sin_foto");

$result = $newauto->modificar();

if ($result == true) {
    $response = array("exito" => true, "mensaje" => "Auto modificado con éxito");
} else {
    $response = array("exito" => false, "mensaje" => "No se pudo modificar el auto");
}

echo json_encode($response); // Devuelve la respuesta como JSON
