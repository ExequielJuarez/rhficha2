/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: vehiculos_db
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alerta`
--

DROP TABLE IF EXISTS `alerta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerta` (
  `id_alerta` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` enum('licencia_vencida','licencia_proxima','mantenimiento_pendiente','mantenimiento_finalizado','documentacion_vencida','vehiculo_fuera_servicio','herramienta_devuelta','prestamo_vencido','critica','informativa') NOT NULL,
  `prioridad` enum('alta','media','baja') NOT NULL DEFAULT 'media',
  `mensaje` varchar(255) NOT NULL,
  `entidad_tipo` varchar(50) DEFAULT NULL,
  `entidad_id` int(11) DEFAULT NULL,
  `entidad_nombre` varchar(100) DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `generada_automaticamente` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_alerta`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerta`
--

LOCK TABLES `alerta` WRITE;
/*!40000 ALTER TABLE `alerta` DISABLE KEYS */;
INSERT INTO `alerta` VALUES
(1,'documentacion_vencida','media','RTO/VTV vence en 1 días','Vehiculo',1,'TOYOTA HAYLUX (PPP101)',1,1,'2026-06-10 01:46:23','2026-06-10 01:50:27'),
(2,'documentacion_vencida','alta','Póliza de seguro vencida hace 62 días','Vehiculo',2,'Mercedez Benz  Tector (IEK812)',0,1,'2026-06-10 01:46:23','2026-06-10 01:46:23'),
(3,'documentacion_vencida','media','RTO/VTV vence en 2 días','Vehiculo',1,'TOYOTA HAYLUX (PPP101)',0,1,'2026-06-10 01:49:12','2026-06-10 01:49:12'),
(4,'documentacion_vencida','alta','RTO/VTV vencida hace 3 días','Vehiculo',1,'TOYOTA HAYLUX (PPP101)',0,1,'2026-06-15 00:45:47','2026-06-15 00:45:47'),
(5,'documentacion_vencida','alta','Póliza de seguro vencida hace 67 días','Vehiculo',2,'Mercedez Benz  Tector (IEK812)',0,1,'2026-06-15 00:45:47','2026-06-15 00:45:47'),
(6,'documentacion_vencida','alta','RTO/VTV vencida hace 4 días','Vehiculo',1,'TOYOTA HAYLUX (PPP101)',0,1,'2026-06-15 12:32:01','2026-06-15 12:32:01'),
(7,'documentacion_vencida','alta','Póliza de seguro vencida hace 68 días','Vehiculo',2,'Mercedez Benz  Tector (IEK812)',0,1,'2026-06-15 12:32:01','2026-06-15 12:32:01'),
(8,'documentacion_vencida','alta','RTO/VTV vencida hace 5 días','Vehiculo',1,'TOYOTA HAYLUX (PPP101)',0,1,'2026-06-16 12:07:06','2026-06-16 12:07:06'),
(9,'documentacion_vencida','alta','Póliza de seguro vencida hace 69 días','Vehiculo',2,'Mercedez Benz  Tector (IEK812)',0,1,'2026-06-16 12:07:06','2026-06-16 12:07:06'),
(10,'documentacion_vencida','alta','RTO/VTV vencida hace 6 días','Vehiculo',1,'TOYOTA HAYLUX (PPP101)',0,1,'2026-06-17 13:05:38','2026-06-17 13:05:38'),
(11,'documentacion_vencida','alta','Póliza de seguro vencida hace 70 días','Vehiculo',2,'Mercedez Benz  Tector (IEK812)',0,1,'2026-06-17 13:05:38','2026-06-17 13:05:38');
/*!40000 ALTER TABLE `alerta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignacion_vehiculo`
--

DROP TABLE IF EXISTS `asignacion_vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignacion_vehiculo` (
  `id_asignacion` int(11) NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int(11) NOT NULL,
  `id_chofer` int(11) NOT NULL,
  `fecha_salida` datetime NOT NULL,
  `fecha_estimada_devolucion` datetime DEFAULT NULL,
  `fecha_devolucion` datetime DEFAULT NULL,
  `destino_area` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_asignacion`),
  KEY `idx_asig_vehiculo` (`id_vehiculo`),
  KEY `idx_asig_chofer` (`id_chofer`),
  CONSTRAINT `fk_asig_chofer` FOREIGN KEY (`id_chofer`) REFERENCES `chofer` (`id_chofer`),
  CONSTRAINT `fk_asig_vehiculo` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculo` (`id_vehiculo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignacion_vehiculo`
--

LOCK TABLES `asignacion_vehiculo` WRITE;
/*!40000 ALTER TABLE `asignacion_vehiculo` DISABLE KEYS */;
INSERT INTO `asignacion_vehiculo` VALUES
(1,2,1,'2026-06-09 00:00:00','2026-06-13 00:00:00','2026-06-09 14:03:00','Distrito Norte Obras publicas ','tiene una optica rota ','Finalizado'),
(2,2,1,'2026-06-09 00:00:00','2026-06-11 00:00:00',NULL,'Distrito Norte Obras publicas ','Va con Gomez Martin de acompañante ','Activo'),
(3,1,2,'2026-06-15 00:00:00','2026-06-18 00:00:00','2026-06-16 12:55:15','Guayamba ','controlar fecha de regreso ','Finalizado');
/*!40000 ALTER TABLE `asignacion_vehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id_auditoria` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `tabla_afectada` varchar(100) NOT NULL,
  `id_registro_afectado` int(11) DEFAULT NULL,
  `accion` varchar(20) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_audit_usuario` (`id_usuario`),
  KEY `idx_audit_fecha` (`fecha`),
  CONSTRAINT `fk_audit_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
INSERT INTO `auditoria` VALUES
(1,1,'sistema',NULL,'INICIO','2026-06-04','11:39:10',NULL,NULL,'Se inicializó el módulo de Auditoría con éxito.'),
(2,1,'usuario',3,'CREAR','2026-06-15','11:14:25',NULL,'{\"nombre\":\"Walter Daniel\",\"apellido\":\"Gueleb\",\"nombre_usuario\":\"walter\",\"id_rol\":\"2\",\"permisos\":\"Mantenimientos\",\"activo\":true}','Alta usuario: Walter Daniel Gueleb (walter)'),
(3,1,'usuario',3,'EDITAR','2026-06-15','11:14:42','{\"nombre\":\"Walter Daniel\",\"id_rol\":2,\"permisos\":\"Mantenimientos\",\"activo\":true}','{\"nombre\":\"Walter Dani\",\"id_rol\":\"2\",\"permisos\":\"Mantenimientos\",\"activo\":true}','Edición de usuario ID: 3 (walter).'),
(4,1,'usuario',3,'EDITAR','2026-06-15','11:14:54','{\"nombre\":\"Walter Dani\",\"id_rol\":2,\"permisos\":\"Mantenimientos\",\"activo\":true}','{\"nombre\":\"Walter Daniel\",\"id_rol\":\"2\",\"permisos\":\"Mantenimientos\",\"activo\":true}','Edición de usuario ID: 3 (walter).'),
(5,1,'usuario',2,'EDITAR','2026-06-15','11:18:55','{\"nombre\":\"Carlos \",\"id_rol\":3,\"permisos\":\"Vehicles\",\"activo\":true}','{\"nombre\":\"Carlos \",\"id_rol\":\"3\",\"permisos\":\"Vehicles,Choferes\",\"activo\":true}','Edición de usuario ID: 2 (carlos_oficina).'),
(6,1,'siniestro',1,'CREAR','2026-06-15','12:56:40',NULL,NULL,'Siniestro registrado en: Ruta 9 Km 1120'),
(7,1,'usuario',2,'EDITAR','2026-06-15','14:16:10','{\"nombre\":\"Carlos \",\"id_rol\":3,\"permisos\":\"Vehicles,Choferes\",\"activo\":true}','{\"nombre\":\"Carlos \",\"id_rol\":\"3\",\"permisos\":\"Vehicles,Choferes,Auditoria\",\"activo\":true}','Edición de usuario ID: 2 (carlos_oficina).'),
(8,2,'chofer',2,'EDITAR','2026-06-15','14:36:01','{\"nombre\":\"Alberto \",\"apellido\":\"Gomez\",\"estado\":\"Activo\"}','{\"nombre\":\"Alberto \",\"apellido\":\"Santillan \",\"estado\":\"Activo\"}','Edición de chofer ID: 2 (Alberto  Santillan )'),
(9,1,'usuario',3,'EDITAR','2026-06-15','14:38:09','{\"nombre\":\"Walter Daniel\",\"id_rol\":2,\"permisos\":\"Mantenimientos\",\"activo\":true}','{\"nombre\":\"Walter Daniel\",\"id_rol\":\"2\",\"permisos\":\"Choferes,Mantenimientos,Auditoria\",\"activo\":true}','Edición de usuario ID: 3 (walter).'),
(10,3,'chofer',2,'EDITAR','2026-06-15','14:38:59','{\"nombre\":\"Alberto \",\"apellido\":\"Santillan \",\"estado\":\"Activo\"}','{\"nombre\":\"Alberto \",\"apellido\":\"Juarez\",\"estado\":\"Activo\"}','Edición de chofer ID: 2 (Alberto  Juarez)'),
(11,1,'chofer',1,'EDITAR','2026-06-16','14:38:28','{\"nombre\":\"Exequiel \",\"apellido\":\"Cejas \",\"estado\":\"Activo\"}','{\"nombre\":\"Exequiel \",\"apellido\":\"Cejas \",\"estado\":\"Activo\"}','Edición de chofer ID: 1 (Exequiel  Cejas )');
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chofer`
--

DROP TABLE IF EXISTS `chofer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `chofer` (
  `id_chofer` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Activo',
  `fechaNacimiento` date DEFAULT NULL,
  `fechaIngreso` date DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `turno` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id_chofer`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chofer`
--

LOCK TABLES `chofer` WRITE;
/*!40000 ALTER TABLE `chofer` DISABLE KEYS */;
INSERT INTO `chofer` VALUES
(1,'Exequiel ','Cejas ','40177059','03855830858','San Gregorio Manzana Q Lote 15 Barrio Santa Lucia Ampliación 125 viviendas','Activo','1985-09-24','2024-11-05','cejas@gmail.com','Mañana','2026-06-09 12:29:22','2026-06-16 17:38:28'),
(2,'Alberto ','Juarez','40123987','3855854693','San Carlos 825 Barrio Senz Germani','Activo','1987-06-02','2026-06-15','alberto@gmail.com','Tarde','2026-06-15 15:32:25','2026-06-15 17:38:59'),
(3,'Mariano','Santillán','32111222','3854111222',NULL,'Activo',NULL,NULL,NULL,NULL,NULL,NULL),
(4,'Juan','Pérez','28555444','3854333444',NULL,'Activo',NULL,NULL,NULL,NULL,NULL,NULL),
(5,'Carlos','Gómez','30123456','3854555666',NULL,'Inactivo',NULL,NULL,NULL,NULL,NULL,NULL),
(6,'Luis','Martínez','35987654','3854777888',NULL,'De Licencia',NULL,NULL,NULL,NULL,NULL,NULL),
(7,'Miguel','López','25444333','3854999000',NULL,'Activo',NULL,NULL,NULL,NULL,NULL,NULL),
(8,'Laura','Silva','36111222','3854112233',NULL,'Activo',NULL,NULL,NULL,NULL,NULL,NULL),
(9,'Martín','Castro','33222444','3854223344',NULL,'Activo',NULL,NULL,NULL,NULL,NULL,NULL),
(10,'Sofía','Luna','39444555','3854334455',NULL,'De Licencia',NULL,NULL,NULL,NULL,NULL,NULL),
(11,'Pedro','Herrera','27555666','3854445566',NULL,'Activo',NULL,NULL,NULL,NULL,NULL,NULL),
(12,'Romina','Rojas','31666777','3854556677',NULL,'Inactivo',NULL,NULL,NULL,NULL,NULL,NULL),
(13,'Gabriel','Cabrera','38777888','3854667788',NULL,'Activo',NULL,NULL,NULL,NULL,NULL,NULL),
(14,'Julieta','Giménez','40888999','3854778899',NULL,'Activo',NULL,NULL,NULL,NULL,NULL,NULL),
(15,'Pablo','Acosta','26999000','3854889900',NULL,'Activo',NULL,NULL,NULL,NULL,NULL,NULL),
(16,'Ana','Ríos','35000111','3854990011',NULL,'De Licencia',NULL,NULL,NULL,NULL,NULL,NULL),
(17,'Lucas','Vega','32123987','3854001122',NULL,'Activo',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `chofer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_mantenimiento`
--

DROP TABLE IF EXISTS `detalle_mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_mantenimiento` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_mantenimiento` int(11) NOT NULL,
  `id_repuesto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `costo_unitario` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_det_mant` (`id_mantenimiento`),
  KEY `fk_det_repuesto` (`id_repuesto`),
  CONSTRAINT `fk_det_mant` FOREIGN KEY (`id_mantenimiento`) REFERENCES `mantenimiento` (`id_mantenimiento`),
  CONSTRAINT `fk_det_repuesto` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_mantenimiento`
--

LOCK TABLES `detalle_mantenimiento` WRITE;
/*!40000 ALTER TABLE `detalle_mantenimiento` DISABLE KEYS */;
INSERT INTO `detalle_mantenimiento` VALUES
(3,7,1,1,20000.00),
(4,8,1,1,18000.00),
(5,9,3,2,6000.00),
(6,10,4,1,10000.00),
(7,11,1,1,6500.00),
(8,11,2,1,8000.00),
(9,12,1,1,6500.00);
/*!40000 ALTER TABLE `detalle_mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `distritos`
--

DROP TABLE IF EXISTS `distritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `distritos` (
  `id_distrito` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_distrito`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `distritos`
--

LOCK TABLES `distritos` WRITE;
/*!40000 ALTER TABLE `distritos` DISABLE KEYS */;
INSERT INTO `distritos` VALUES
(1,'Centro '),
(2,'Norte'),
(3,'Sur');
/*!40000 ALTER TABLE `distritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentacion`
--

DROP TABLE IF EXISTS `documentacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentacion` (
  `id_documentacion` int(11) NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int(11) NOT NULL,
  `tipo_documento` varchar(100) NOT NULL,
  `fecha_emision` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Vigente',
  PRIMARY KEY (`id_documentacion`),
  KEY `idx_doc_vencimiento` (`id_vehiculo`,`fecha_vencimiento`),
  CONSTRAINT `fk_doc_vehiculo` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculo` (`id_vehiculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentacion`
--

LOCK TABLES `documentacion` WRITE;
/*!40000 ALTER TABLE `documentacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `herramienta`
--

DROP TABLE IF EXISTS `herramienta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `herramienta` (
  `id_herramienta` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_activo` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'Disponible',
  `stock` int(11) NOT NULL DEFAULT 1,
  `combustible_energia` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `fecha_alta` datetime NOT NULL,
  PRIMARY KEY (`id_herramienta`),
  UNIQUE KEY `codigo_activo` (`codigo_activo`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `herramienta`
--

LOCK TABLES `herramienta` WRITE;
/*!40000 ALTER TABLE `herramienta` DISABLE KEYS */;
INSERT INTO `herramienta` VALUES
(2,'HTI-002','Amoladora','Construcción A','Disponible',2,'Energia','Se encuentran en buen estado','Sin título.jpg','2026-05-11 03:08:56'),
(3,'HTI-003','Destornillador percutor','Taller Mecánico','En uso',1,'Energia','Prueba 3','','2026-05-12 00:30:35'),
(4,'HTI-001','Amoladora Angular Bosch 4.5\"','Taller Mecánico','Disponible',3,NULL,NULL,NULL,'0000-00-00 00:00:00'),
(5,'HTI-004','Gato Hidráulico 20T','Depósito Central','Disponible',4,NULL,NULL,NULL,'0000-00-00 00:00:00'),
(6,'HTI-005','Caja de Tubos Mando 1/2 (Juego)','Mantenimiento General','Disponible',5,NULL,NULL,NULL,'0000-00-00 00:00:00'),
(9,'HTI-006','Soldadora Inverter 200A','Taller Mecánico','Disponible',2,NULL,NULL,NULL,'2024-01-10 00:00:00'),
(10,'HTI-007','Hidrolavadora Industrial 150 Bar','Mantenimiento General','En Reparación',1,NULL,NULL,NULL,'2023-11-05 00:00:00'),
(11,'HTI-008','Compresor de Aire 50L','Taller Mecánico','Disponible',3,NULL,NULL,NULL,'2023-08-20 00:00:00'),
(12,'HTI-009','Sierra Circular 7 1/4\"','Construcción A','Disponible',2,NULL,NULL,NULL,'2024-03-15 00:00:00'),
(13,'HTI-010','Llave Dinamométrica 1/2\"','Taller Mecánico','Disponible',4,NULL,NULL,NULL,'2023-06-30 00:00:00'),
(14,'HTI-011','Cortadora de Césped Naftera','Espacios Verdes','Disponible',5,NULL,NULL,NULL,'2023-09-12 00:00:00'),
(15,'HTI-012','Motosierra Stihl MS170','Espacios Verdes','En Reparación',3,NULL,NULL,NULL,'2024-02-28 00:00:00'),
(16,'HTI-013','Taladro de Banco 16mm','Taller Mecánico','Disponible',1,NULL,NULL,NULL,'2023-05-14 00:00:00'),
(17,'HTI-014','Hormigonera 130L','Construcción A','Disponible',4,NULL,NULL,NULL,'2024-04-10 00:00:00'),
(18,'HTI-015','Escalera de Aluminio 12 Escalones','Mantenimiento General','Disponible',6,NULL,NULL,NULL,'2023-12-01 00:00:00');
/*!40000 ALTER TABLE `herramienta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_km`
--

DROP TABLE IF EXISTS `historial_km`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_km` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int(11) NOT NULL,
  `km_anterior` int(11) NOT NULL,
  `km_nuevo` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `id_vehiculo` (`id_vehiculo`),
  CONSTRAINT `historial_km_ibfk_1` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculo` (`id_vehiculo`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_km`
--

LOCK TABLES `historial_km` WRITE;
/*!40000 ALTER TABLE `historial_km` DISABLE KEYS */;
INSERT INTO `historial_km` VALUES
(1,2,50000,65000,'2026-06-09',NULL);
/*!40000 ALTER TABLE `historial_km` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `licencia_chofer`
--

DROP TABLE IF EXISTS `licencia_chofer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `licencia_chofer` (
  `id_licencia` int(11) NOT NULL AUTO_INCREMENT,
  `id_chofer` int(11) NOT NULL,
  `numero` varchar(50) NOT NULL,
  `categoria` varchar(20) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_licencia`),
  KEY `fk_licencia_chofer` (`id_chofer`),
  CONSTRAINT `fk_licencia_chofer` FOREIGN KEY (`id_chofer`) REFERENCES `chofer` (`id_chofer`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `licencia_chofer`
--

LOCK TABLES `licencia_chofer` WRITE;
/*!40000 ALTER TABLE `licencia_chofer` DISABLE KEYS */;
INSERT INTO `licencia_chofer` VALUES
(1,1,'31825317','C','2022-01-28','2027-01-28','chofer-1781631508218'),
(2,2,'31825317321','B2','2026-06-03','2027-01-03','chofer-1781537545786.jpg');
/*!40000 ALTER TABLE `licencia_chofer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimiento`
--

DROP TABLE IF EXISTS `mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimiento` (
  `id_mantenimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo_servicio` varchar(100) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `km_servicio` int(11) NOT NULL,
  `costo_total` decimal(12,2) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `proximo_km` int(11) DEFAULT NULL,
  `proxima_fecha` date DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Realizado',
  `mano_obra` decimal(12,2) DEFAULT 0.00,
  `costo_repuestos` decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`id_mantenimiento`),
  KEY `fk_mant_usuario` (`id_usuario`),
  KEY `idx_mant_vehiculo` (`id_vehiculo`),
  KEY `idx_mant_fecha` (`fecha_inicio`),
  CONSTRAINT `fk_mant_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `fk_mant_vehiculo` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculo` (`id_vehiculo`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento`
--

LOCK TABLES `mantenimiento` WRITE;
/*!40000 ALTER TABLE `mantenimiento` DISABLE KEYS */;
INSERT INTO `mantenimiento` VALUES
(2,1,1,'Frenos','2026-06-09','2026-06-09',100000,100000.00,'se desarmo rueda y se cambio las pastillas de freno ',NULL,110000,NULL,'Realizado',0.00,0.00),
(7,2,1,'Cambio de aceite','2026-06-09','2026-06-09',50000,8000.00,'Se realizo cambio del filtro de aceite ','Queda pendiente cambio del filtro de aire ',60000,NULL,'Realizado',0.00,0.00),
(8,2,1,'Cambio de filtros','2026-06-09','2026-06-09',50000,9000.00,'Se cambio filtro de aceite ','falta cambiar filtro de aire ',60000,NULL,'Realizado',0.00,0.00),
(9,1,1,'Service general','2026-06-09','2026-06-09',100000,7000.00,'Se desmonto rueda y se cambiaron ambas pastillas de freno ','falta alineado y balanceado ',120000,NULL,'Realizado',0.00,0.00),
(10,1,1,'Transmisión','2026-06-14','2026-06-14',100000,10000.00,NULL,NULL,NULL,NULL,'Realizado',0.00,0.00),
(11,1,1,'Cambio de aceite y filtro ','2026-06-17',NULL,100000,24500.00,'Se purgo el aceite viejo y cambio el filtro ','Pasaron muchos kilometros del ultimo cambio de aceite ',110000,NULL,'En proceso',0.00,0.00),
(12,1,1,'Cambio de aceite y filtro ','2026-06-17',NULL,100000,11000.00,'Recambio de filtro fallado','',110000,NULL,'Realizado',4500.00,6500.00),
(13,1,1,'Service General 10K','2025-10-15',NULL,84000,41500.00,'Cambio de aceite, filtros y revisión general.','El vehículo se encuentra en óptimas condiciones.',NULL,NULL,'Realizado',15000.00,26500.00),
(14,2,1,'Cambio de Neumáticos','2026-01-10',NULL,115000,725000.00,'Reemplazo de 2 neumáticos delanteros.','Se recomienda alinear en el próximo viaje.',NULL,NULL,'Realizado',25000.00,700000.00),
(15,4,1,'Cambio de Batería','2025-12-20',NULL,190000,125000.00,'Instalación de batería nueva 12V 75Ah.','La batería vieja no retenía carga.',NULL,NULL,'Realizado',5000.00,120000.00),
(16,5,1,'Service Preventivo','2026-05-02',NULL,158000,0.00,'Revisión de niveles programada.','Turno agendado para la semana próxima.',NULL,NULL,'Pendiente',0.00,0.00),
(18,1,1,'Cambio de Amortiguadores','2026-06-10',NULL,87000,245000.00,'Sustitución de amortiguadores delanteros por pérdida de fluido.','Revisar espirales en el próximo service.',NULL,NULL,'Realizado',60000.00,185000.00),
(19,2,1,'Falla de Inyección','2026-06-12',NULL,121500,380000.00,'Reemplazo de 2 inyectores Common Rail defectuosos.','Se purgó el sistema de combustible.',NULL,NULL,'Realizado',80000.00,300000.00),
(20,4,1,'Cambio Bomba de Agua','2026-05-28',NULL,192000,120000.00,'Pérdida de refrigerante por la empaquetadura de la bomba.','Limpieza del circuito de refrigeración completa.',NULL,NULL,'Realizado',45000.00,75000.00),
(21,5,1,'Rotura de Espejo','2026-06-05',NULL,161000,48000.00,'Cambio de espejo retrovisor derecho roto en maniobra.','Sin daños en la puerta.',NULL,NULL,'Realizado',10000.00,38000.00),
(22,6,1,'Cambio de Correas','2026-06-14',NULL,111000,102000.00,'Sustitución de correa de distribución y Poly-V por kilometraje.','Tensores y rodillos en tolerancia.',NULL,NULL,'Realizado',35000.00,67000.00),
(23,7,1,'Service Aire Acondicionado','2025-12-10',NULL,9500,31500.00,'Recarga de gas R134a y cambio de filtro de habitáculo.','Compresor acopla correctamente.',NULL,NULL,'Realizado',25000.00,6500.00),
(24,8,1,'Revisión Sistema Eléctrico','2026-06-16',NULL,46000,15000.00,'Falso contacto en luces de stop traseras.','Buscando cortocircuito en el ramal.',NULL,NULL,'En proceso',15000.00,0.00),
(25,9,1,'Cambio Bomba de Freno','2026-04-10',NULL,450500,125000.00,'Pedal esponjoso. Reemplazo de bomba principal.','Se purgó el sistema con líquido DOT4.',NULL,NULL,'Realizado',40000.00,85000.00),
(26,10,1,'Mantenimiento Preventivo 100K','2026-06-01',NULL,99500,0.00,'Service programado de los 100.000 km.','Falta confirmar disponibilidad del vehículo.',NULL,NULL,'Pendiente',0.00,0.00);
/*!40000 ALTER TABLE `mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_stock`
--

DROP TABLE IF EXISTS `movimiento_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_stock` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_repuesto` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo_movimiento` varchar(20) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_mov_repuesto` (`id_repuesto`),
  KEY `fk_mov_usuario` (`id_usuario`),
  CONSTRAINT `fk_mov_repuesto` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`),
  CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_stock`
--

LOCK TABLES `movimiento_stock` WRITE;
/*!40000 ALTER TABLE `movimiento_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimiento_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operarios`
--

DROP TABLE IF EXISTS `operarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `operarios` (
  `id_operario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado` varchar(50) DEFAULT 'Activo',
  PRIMARY KEY (`id_operario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operarios`
--

LOCK TABLES `operarios` WRITE;
/*!40000 ALTER TABLE `operarios` DISABLE KEYS */;
INSERT INTO `operarios` VALUES
(1,'Hernán Quiroga','Activo'),
(2,'Marcos Díaz','Activo'),
(5,'Gomez Juan','Activo');
/*!40000 ALTER TABLE `operarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestamo`
--

DROP TABLE IF EXISTS `prestamo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestamo` (
  `id_prestamo` int(11) NOT NULL AUTO_INCREMENT,
  `id_herramienta` int(11) NOT NULL,
  `nombre_operario` varchar(100) NOT NULL,
  `fecha_salida` datetime NOT NULL,
  `fecha_devolucion_estimada` datetime DEFAULT NULL,
  `fecha_devolucion_real` datetime DEFAULT NULL,
  `sector_destino` varchar(100) DEFAULT NULL,
  `estado_prestamo` varchar(50) NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_prestamo`),
  KEY `fk_prestamo_herramienta` (`id_herramienta`),
  KEY `idx_prestamo_estado` (`estado_prestamo`),
  CONSTRAINT `fk_prestamo_herramienta` FOREIGN KEY (`id_herramienta`) REFERENCES `herramienta` (`id_herramienta`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestamo`
--

LOCK TABLES `prestamo` WRITE;
/*!40000 ALTER TABLE `prestamo` DISABLE KEYS */;
INSERT INTO `prestamo` VALUES
(3,2,'Gomez Juan','2026-05-11 00:00:00','2026-05-20 00:00:00','2026-05-11 03:10:00','Espacios Verdes','Finalizado'),
(4,2,'Juan Pérez','2026-05-12 00:00:00','2026-06-20 00:00:00','2026-05-11 03:10:44','Taller Central','Finalizado'),
(5,3,'Gomez Juan','2026-05-11 00:00:00','2026-06-30 00:00:00',NULL,'Construcción A','Activo');
/*!40000 ALTER TABLE `prestamo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repuesto`
--

DROP TABLE IF EXISTS `repuesto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `repuesto` (
  `id_repuesto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `unidad_medida` varchar(30) DEFAULT NULL,
  `stock_actual` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_repuesto`),
  KEY `idx_stock_repuesto` (`stock_actual`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repuesto`
--

LOCK TABLES `repuesto` WRITE;
/*!40000 ALTER TABLE `repuesto` DISABLE KEYS */;
INSERT INTO `repuesto` VALUES
(1,'Filtro de aceite','Filtro para motor','unidad',20,5),
(2,'Aceite 15W40','Aceite lubricante','litro',50,10),
(3,'Pastillas de freno','Juego delantero','juego',15,3),
(4,'Correa de distribución','Correa motor','unidad',8,2);
/*!40000 ALTER TABLE `repuesto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repuestos`
--

DROP TABLE IF EXISTS `repuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `repuestos` (
  `id_repuesto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `costo_unitario` decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`id_repuesto`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repuestos`
--

LOCK TABLES `repuestos` WRITE;
/*!40000 ALTER TABLE `repuestos` DISABLE KEYS */;
INSERT INTO `repuestos` VALUES
(1,'Filtro de Aceite (Universal)',14,6500.00),
(2,'Aceite Sintético 10W40 (1 Litro)',30,8000.00),
(4,'Filtro de aire ',15,15000.00),
(5,'Pastillade freno ',12,8000.00),
(6,'Filtro de Aceite (Camioneta)',25,8500.00),
(7,'Filtro de Aire (Camión)',12,14000.00),
(8,'Filtro de Combustible (Diesel)',18,11500.00),
(9,'Aceite Motor 15W40 (Tambor 20L)',8,85000.00),
(10,'Aceite Sintético 5W30 (1L)',45,9500.00),
(11,'Pastillas de Freno (Juego Delantero)',10,35000.00),
(12,'Batería 12V 75Ah',5,120000.00),
(13,'Amortiguador Delantero (Par)',4,185000.00),
(14,'Bomba de Agua (Diesel)',6,75000.00),
(15,'Kit de Embrague Completo',3,320000.00),
(16,'Óptica Trasera Izquierda',15,45000.00),
(17,'Espejo Retrovisor Derecho',10,38000.00),
(18,'Cruceta de Cardán',22,18000.00),
(19,'Inyector Common Rail',8,150000.00),
(20,'Filtro de Habitáculo',40,6500.00),
(21,'Correa Poly-V',30,22000.00),
(22,'Bomba de Freno',5,85000.00);
/*!40000 ALTER TABLE `repuestos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `permisos` varchar(255) DEFAULT 'Vehicles',
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES
(1,'Administrador','Acceso total al sistema','Vehicles'),
(2,'Jefe de Taller','Acceso a mantenimientos, repuestos y herramientas','Vehicles'),
(3,'Principal','Acceso de supervisión general y reportes','Vehicles,Choferes');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sectores`
--

DROP TABLE IF EXISTS `sectores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sectores` (
  `id_sector` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_sector`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sectores`
--

LOCK TABLES `sectores` WRITE;
/*!40000 ALTER TABLE `sectores` DISABLE KEYS */;
INSERT INTO `sectores` VALUES
(2,'Construcción A'),
(3,'Taller Mecánico'),
(6,'Espacios Verdes');
/*!40000 ALTER TABLE `sectores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siniestro`
--

DROP TABLE IF EXISTS `siniestro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `siniestro` (
  `id_siniestro` int(11) NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int(11) NOT NULL,
  `chofer_involucrado` varchar(100) DEFAULT NULL,
  `fecha_siniestro` date NOT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `relato` text DEFAULT NULL,
  `tercero_nombre` varchar(100) DEFAULT NULL,
  `tercero_patente` varchar(20) DEFAULT NULL,
  `tercero_aseguradora` varchar(100) DEFAULT NULL,
  `tercero_poliza` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'En Proceso',
  `archivos_adjuntos` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_siniestro`),
  KEY `id_vehiculo` (`id_vehiculo`),
  CONSTRAINT `siniestro_ibfk_1` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculo` (`id_vehiculo`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siniestro`
--

LOCK TABLES `siniestro` WRITE;
/*!40000 ALTER TABLE `siniestro` DISABLE KEYS */;
INSERT INTO `siniestro` VALUES
(1,5,'Exequiel Santillan ','2026-06-15','Ruta 9 Km 1120','El vehiculo del Sr. Juan Perez cruzo en rojo  el semaforo y choco la parte trasera (la caja de la camioneta)','Juan Perez ','AB123CD','La Caja ','12131645562','EN PROCESO','siniestro-1781539000572.jpeg','2026-06-15 15:56:40','2026-06-15 15:56:40');
/*!40000 ALTER TABLE `siniestro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_vehiculo`
--

DROP TABLE IF EXISTS `tipo_vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_vehiculo` (
  `id_tipo` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  PRIMARY KEY (`id_tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_vehiculo`
--

LOCK TABLES `tipo_vehiculo` WRITE;
/*!40000 ALTER TABLE `tipo_vehiculo` DISABLE KEYS */;
INSERT INTO `tipo_vehiculo` VALUES
(1,'Camioneta'),
(2,'Camión'),
(3,'Maquinaria Pesada'),
(4,'Utilitario'),
(5,'Auto'),
(6,'Motocicleta'),
(7,'Camioneta'),
(8,'Camión');
/*!40000 ALTER TABLE `tipo_vehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `id_rol` int(11) NOT NULL,
  `permisos` varchar(255) DEFAULT 'Vehicles',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES
(1,'admin','$2b$10$9eCklbUJ0HhkoHQ1cHT6YOJ6xSg5S4F9G8P17lqKlmMgmOPBTJh1G','Administrador','Sistema',1,1,'Vehicles,Choferes,Mantenimientos,Tools,Usuarios,Auditoria'),
(2,'carlos_oficina','$2b$10$TUCOaKrHUOH6RVJoyK2vsuJvbC2hvni.6A7SxSQ.5A4EXuDPS54bi','Carlos ','Gerez ',1,3,'Vehicles,Choferes,Auditoria'),
(3,'walter','$2b$10$SIlilzbVXicCXm748lXyRuMO2zgXy1We2ucD8F7iehBvbyoJw0Ley','Walter Daniel','Gueleb',1,2,'Choferes,Mantenimientos,Auditoria');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehiculo`
--

DROP TABLE IF EXISTS `vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehiculo` (
  `id_vehiculo` int(11) NOT NULL AUTO_INCREMENT,
  `patente` varchar(20) NOT NULL,
  `legajo` varchar(30) DEFAULT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `anio` int(11) NOT NULL,
  `id_tipo` int(11) NOT NULL,
  `num_chasis` varchar(50) DEFAULT NULL,
  `num_motor` varchar(50) DEFAULT NULL,
  `combustible` varchar(30) DEFAULT NULL,
  `transmision` varchar(30) DEFAULT NULL,
  `km_actual` int(11) NOT NULL DEFAULT 0,
  `cedula_numero` varchar(100) DEFAULT NULL,
  `cedula_titular` varchar(150) DEFAULT NULL,
  `seguro_compania` varchar(100) DEFAULT NULL,
  `seguro_vencimiento` date DEFAULT NULL,
  `rto_vencimiento` date DEFAULT NULL,
  `estado_actual` varchar(50) NOT NULL DEFAULT 'Disponible',
  `distrito` varchar(50) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `fecha_alta` date NOT NULL,
  `fecha_baja` date DEFAULT NULL,
  PRIMARY KEY (`id_vehiculo`),
  UNIQUE KEY `patente` (`patente`),
  UNIQUE KEY `legajo` (`legajo`),
  KEY `fk_vehiculo_tipo` (`id_tipo`),
  KEY `idx_vehiculo_patente` (`patente`),
  KEY `idx_vehiculo_estado` (`estado_actual`),
  CONSTRAINT `fk_vehiculo_tipo` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_vehiculo` (`id_tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiculo`
--

LOCK TABLES `vehiculo` WRITE;
/*!40000 ALTER TABLE `vehiculo` DISABLE KEYS */;
INSERT INTO `vehiculo` VALUES
(1,'PPP101',NULL,'TOYOTA','HAYLUX',2000,1,'212313545615646531321546','45642132164654654134654',NULL,'Manual',100000,'12345689','Municipalidad Capital','Federacion Patronal','2027-10-26','2026-06-11','Disponible','Centro',NULL,'Carga de Prueba','viscosidad-del-agua-1024x683.jpg.jpg','2026-05-10',NULL),
(2,'IEK812',NULL,'Mercedez Benz ','Tector',2001,2,'212313545615646531321550','45642132164654654134678',NULL,'Manual',65000,'12345690','Municipalidad Capital','Federacion Patronal','2026-04-08','2027-03-02','En uso','Centro',NULL,'',NULL,'2026-06-09',NULL),
(4,'GJG306',NULL,'FORD','ICAÑO',2005,1,'212313545615646531321559','45642132164654654134672',NULL,'Manual',90000,NULL,NULL,NULL,NULL,NULL,'En mantenimiento','Centro',NULL,'',NULL,'2026-06-09',NULL),
(5,'AE326HY',NULL,'CHEVROLET','S-10',2015,1,'212313545615646531321597','45642132164654654134397',NULL,'Manual',250000,'65845632','Municipalidad Banda','San Cristobal','2026-06-12','2026-01-03','Baja','Sur',NULL,NULL,NULL,'2026-06-09',NULL),
(6,'AB123CD',NULL,'Chevrolet','Prisma LTZ',2016,1,'CHASIS001ABC','MOTOR001ABC',NULL,NULL,85000,NULL,NULL,NULL,NULL,NULL,'Disponible','Centro',NULL,NULL,NULL,'2023-01-15',NULL),
(7,'AF987GH',NULL,'Iveco','Tector',2021,2,'CHASIS002DEF','MOTOR002DEF',NULL,NULL,120500,NULL,NULL,NULL,NULL,NULL,'En uso','Norte',NULL,NULL,NULL,'2023-03-20',NULL),
(8,'AD456TR',NULL,'Mercedes-Benz','Atego',2020,2,'CHASIS003GHI','MOTOR003GHI',NULL,NULL,145000,NULL,NULL,NULL,NULL,NULL,'En mantenimiento','Sur',NULL,NULL,NULL,'2023-05-10',NULL),
(9,'AA111AA',NULL,'Toyota','Hilux',2017,1,'CHASIS004JKL','MOTOR004JKL',NULL,NULL,195000,NULL,NULL,NULL,NULL,NULL,'Disponible','Centro',NULL,NULL,NULL,'2023-06-01',NULL),
(10,'AB222BB',NULL,'Ford','Ranger',2018,1,'CHASIS005MNO','MOTOR005MNO',NULL,NULL,160000,NULL,NULL,NULL,NULL,NULL,'En uso','Norte',NULL,NULL,NULL,'2023-07-15',NULL),
(11,'AG123YZ',NULL,'Volkswagen','Amarok V6',2023,1,'CHASIS011KLM','MOTOR011KLM',NULL,NULL,15000,NULL,NULL,NULL,NULL,NULL,'Disponible','Norte',NULL,NULL,NULL,'2024-02-10',NULL),
(12,'AD987XW',NULL,'Volvo','FH 460',2020,2,'CHASIS012NOP','MOTOR012NOP',NULL,NULL,210000,NULL,NULL,NULL,NULL,NULL,'En uso','Sur',NULL,NULL,NULL,'2023-01-20',NULL),
(13,'AA555ZZ',NULL,'Ford','Ranger Raptor',2016,1,'CHASIS013QRS','MOTOR013QRS',NULL,NULL,185000,NULL,NULL,NULL,NULL,NULL,'En mantenimiento','Centro',NULL,NULL,NULL,'2023-04-15',NULL),
(14,'AE444YY',NULL,'John Deere','Tractor 5090E',2022,3,'CHASIS014TUV','MOTOR014TUV',NULL,NULL,4500,NULL,NULL,NULL,NULL,NULL,'En uso','Sur',NULL,NULL,NULL,'2023-08-05',NULL),
(15,'AC321VV',NULL,'Toyota','SW4',2019,1,'CHASIS015WXY','MOTOR015WXY',NULL,NULL,132000,NULL,NULL,NULL,NULL,NULL,'Disponible','Norte',NULL,NULL,NULL,'2023-09-12',NULL),
(16,'AB654UU',NULL,'Scania','R410',2018,2,'CHASIS016ZAB','MOTOR016ZAB',NULL,NULL,320000,NULL,NULL,NULL,NULL,NULL,'En uso','Centro',NULL,NULL,NULL,'2023-11-25',NULL),
(17,'AF777TT',NULL,'Nissan','Frontier',2021,1,'CHASIS017CDE','MOTOR017CDE',NULL,NULL,65000,NULL,NULL,NULL,NULL,NULL,'Disponible','Sur',NULL,NULL,NULL,'2024-01-08',NULL),
(18,'AG888SS',NULL,'Mercedes-Benz','Accelo',2023,2,'CHASIS018FGH','MOTOR018FGH',NULL,NULL,22000,NULL,NULL,NULL,NULL,NULL,'En mantenimiento','Norte',NULL,NULL,NULL,'2024-04-30',NULL),
(19,'AA222RR',NULL,'Bobcat','Minicargadora',2017,3,'CHASIS019IJK','MOTOR019IJK',NULL,NULL,12500,NULL,NULL,NULL,NULL,NULL,'Baja','Centro',NULL,NULL,NULL,'2023-05-18',NULL),
(20,'AD111QQ',NULL,'Renault','Kangoo',2020,1,'CHASIS020LMN','MOTOR020LMN',NULL,NULL,98000,NULL,NULL,NULL,NULL,NULL,'Disponible','Sur',NULL,NULL,NULL,'2023-07-22',NULL);
/*!40000 ALTER TABLE `vehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'vehiculos_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-17 17:39:27

ALTER TABLE siniestro 
  ADD COLUMN id_chofer INT NULL,
  ADD COLUMN danos_vehiculo TEXT NULL,
  ADD COLUMN tercero_vehiculo VARCHAR(100) NULL,
  ADD COLUMN tercero_seguro VARCHAR(100) NULL,
  ADD COLUMN tercero_conductor VARCHAR(100) NULL,
  ADD COLUMN tercero_contacto VARCHAR(100) NULL;
  
  SHOW COLUMNS FROM chofer LIKE 'estado';
  
  ALTER TABLE chofer ADD COLUMN foto_documento VARCHAR(255) NULL;
  
  ALTER TABLE vehiculo ADD COLUMN foto_cedula VARCHAR(255) NULL;
ALTER TABLE vehiculo ADD COLUMN foto_titulo VARCHAR(255) NULL;
ALTER TABLE vehiculo ADD COLUMN foto_rto VARCHAR(255) NULL;

ALTER TABLE alerta MODIFY COLUMN tipo ENUM(
    'licencia_vencida',
    'licencia_proxima',
    'mantenimiento_pendiente',
    'mantenimiento_finalizado',
    'documentacion_vencida',
    'vehiculo_fuera_servicio',
    'vehiculo_en_mantenimiento',
    'herramienta_devuelta',
    'prestamo_vencido',
    'siniestro_activo',
    'critica',
    'informativa'
) NOT NULL;

ALTER TABLE chofer ADD COLUMN motivoBaja TEXT NULL;