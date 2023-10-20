<?php

use PazosNahuel\autoBD;

require_once("./clases/autoBD.php");

$marca = isset($_POST['marca']) ? $_POST['marca'] : null;
$patente = isset($_POST['patente']) ? $_POST['patente'] : null;
$color = isset($_POST['color']) ? $_POST['color'] : null;
$precio = isset($_POST['precio']) ? $_POST['precio'] : null;
$foto = isset($_FILES['foto']) ? $_FILES['foto'] : null;

date_default_timezone_set('America/Argentina/Buenos_Aires');
$tipoArchivo = pathinfo($foto["name"], PATHINFO_EXTENSION);
$path = './autos/imagenes/';
$destino = trim($path) . $marca . "." . date("His") . "." . $tipoArchivo;

if (file_exists($destino) || $foto["size"] > 5000000000000 || !in_array($tipoArchivo, array("jpg", "jpeg", "gif", "png"))) 
{
    $response = array('exito' => false, 'mensaje' => 'Error al cargar la imagen.');
} 
else 
{
    $auto = new autoBD($marca, $patente, $color, $precio, $destino);

    if ($auto->existe($patente)) 
    {
        $response = array('exito' => false, 'mensaje' => 'El auto ya existe.');
    } 
    else 
    {
        $auto->agregar();
        $response = array('exito' => true, 'mensaje' => 'El auto se añadió.');
    }
}

header('Content-Type: application/json');
echo json_encode($response);