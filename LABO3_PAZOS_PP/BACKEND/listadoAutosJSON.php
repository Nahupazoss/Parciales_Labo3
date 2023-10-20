<?php
use PazosNahuel\auto;
require_once './clases/auto.php';

$accion = isset($_GET["accion"]) ? $_GET["accion"] : "sin accion";
$resultado = auto::TraerTodosJSON('./archivos/autos.json');

if ($resultado !== null) 
{
    echo $resultado;
} 
else 
{
    echo "No se pudo cargar el archivo JSON.";
}
