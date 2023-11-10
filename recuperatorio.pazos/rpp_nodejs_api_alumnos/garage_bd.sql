SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `garage_bd` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `garage_bd`;

CREATE TABLE `autos` (
  `patente` varchar(30) NOT NULL,
  `marca` varchar(30) NOT NULL,
  `color` varchar(15) NOT NULL,
  `precio` double NOT NULL,
  `foto` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `autos` (`patente`, `marca`, `color`, `precio`, `foto`) VALUES
('abc123', 'ford', '#e60a36', 150999, 'autos/fotos/abc123.jpeg'),
('abc321', 'renault', '#6d7ce8', 150999, 'autos/fotos/abc321.webp'),
('cba123', 'fiat', '#eeff00', 250000, 'autos/fotos/cba123.jpeg'),
('cba321', 'porche', '#0bf41b', 650000, 'autos/fotos/cba321.jpeg');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
