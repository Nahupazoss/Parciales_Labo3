-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-11-2023 a las 21:27:52
-- Versión del servidor: 10.4.24-MariaDB
-- Versión de PHP: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `vivero_bd`
--
CREATE DATABASE IF NOT EXISTS `vivero_bd` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `vivero_bd`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plantas`
--

CREATE TABLE `plantas` (
  `codigo` varchar(10) NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `color_flor` varchar(10) NOT NULL,
  `precio` double NOT NULL,
  `foto` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `plantas`
--

INSERT INTO `plantas` (`codigo`, `nombre`, `color_flor`, `precio`, `foto`) VALUES
('hel_912', 'helecho', '#049504', 510, 'plantas/fotos/hel_912.jpeg'),
('mar_002', 'margarita', '#ee9211', 3520, 'plantas/fotos/mar_002.jpeg'),
('pot_001', 'potus', '#32ab30', 1500, 'plantas/fotos/pot_001.jpeg');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `plantas`
--
ALTER TABLE `plantas`
  ADD PRIMARY KEY (`codigo`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
