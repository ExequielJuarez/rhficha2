-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: vehiculos_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerta` (
  `id_alerta` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` enum('licencia_vencida','licencia_proxima','mantenimiento_pendiente','mantenimiento_finalizado','documentacion_vencida','vehiculo_fuera_servicio','vehiculo_en_mantenimiento','herramienta_devuelta','prestamo_vencido','siniestro_activo','critica','informativa') NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerta`
--

LOCK TABLES `alerta` WRITE;
/*!40000 ALTER TABLE `alerta` DISABLE KEYS */;
INSERT INTO `alerta` VALUES (1,'licencia_vencida','alta','Licencia de Sergio Villalba vencida hace 57 días','Chofer',2,'Sergio Villalba',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:29'),(2,'documentacion_vencida','media','Póliza de seguro vence en 5 días','Vehiculo',2,'Ford Ranger (AB002CC)',1,1,'2026-07-01 18:18:53','2026-07-02 02:00:12'),(3,'documentacion_vencida','alta','RTO/VTV vencida hace 60 días','Vehiculo',3,'Volkswagen Amarok (AC003DD)',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:30'),(4,'licencia_vencida','alta','Licencia de Marcelo Paz vencida hace 59 días','Chofer',3,'Marcelo Paz',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:30'),(5,'documentacion_vencida','alta','Póliza de seguro vencida hace 59 días','Vehiculo',3,'Volkswagen Amarok (AC003DD)',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:30'),(6,'licencia_vencida','alta','Licencia de Roberto Leiva vencida hace 229 días','Chofer',5,'Roberto Leiva',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:30'),(7,'documentacion_vencida','alta','Póliza de seguro vencida hace 58 días','Vehiculo',5,'Mercedes-Benz Tector (AE005FF)',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:30'),(8,'licencia_vencida','alta','Licencia de Fernando Gutiérrez vencida hace 285 días','Chofer',6,'Fernando Gutiérrez',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:30'),(9,'documentacion_vencida','alta','Póliza de seguro vencida hace 144 días','Vehiculo',6,'Scania R410 (AF006GG)',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:30'),(10,'licencia_vencida','alta','Licencia de Pablo Soria vencida hace 175 días','Chofer',7,'Pablo Soria',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:30'),(11,'documentacion_vencida','alta','Póliza de seguro vencida hace 123 días','Vehiculo',7,'Iveco Tector 170E28 (AG007HH)',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:30'),(12,'licencia_vencida','alta','Licencia de Gustavo Ríos vencida hace 484 días','Chofer',9,'Gustavo Ríos',0,1,'2026-07-01 18:18:53','2026-09-02 01:49:30'),(13,'documentacion_vencida','alta','Póliza de seguro vencida hace 165 días','Vehiculo',8,'Nissan Frontier (AH008II)',0,1,'2026-07-01 18:18:54','2026-09-02 01:49:30'),(14,'licencia_vencida','alta','Licencia de Raúl Cabrera vencida hace 750 días','Chofer',10,'Raúl Cabrera',0,1,'2026-07-01 18:18:54','2026-09-02 01:49:30'),(15,'documentacion_vencida','alta','Póliza de seguro vencida hace 199 días','Vehiculo',9,'Renault Kangoo (AI009JJ)',0,1,'2026-07-01 18:18:54','2026-09-02 01:49:30'),(16,'documentacion_vencida','alta','Póliza de seguro vencida hace 274 días','Vehiculo',10,'Ford Transit (AJ010KK)',0,1,'2026-07-01 18:18:54','2026-09-02 01:49:30'),(17,'licencia_vencida','alta','Licencia de Exequiel Juarez vencida hace 61 días','Chofer',11,'Exequiel Juarez',0,1,'2026-07-01 18:23:13','2026-09-02 01:49:30'),(18,'documentacion_vencida','alta','RTO/VTV vencida hace 32 días','Vehiculo',11,'Ford Ranger (PPKEE2)',0,1,'2026-07-01 20:34:09','2026-09-02 01:49:30'),(19,'documentacion_vencida','alta','Póliza de seguro vencida hace 60 días','Vehiculo',11,'Ford Ranger (PPKEE2)',0,1,'2026-07-01 20:34:09','2026-09-02 01:49:30'),(20,'documentacion_vencida','media','RTO/VTV vence en 9 días','Vehiculo',1,'Toyota Hilux (AA001BB)',0,1,'2026-09-02 01:26:03','2026-09-02 01:49:29'),(21,'documentacion_vencida','alta','RTO/VTV vencida hace 27 días','Vehiculo',8,'Nissan Frontier (AH008II)',0,1,'2026-09-02 01:26:03','2026-09-02 01:49:30');
/*!40000 ALTER TABLE `alerta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignacion_vehiculo`
--

DROP TABLE IF EXISTS `asignacion_vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignacion_vehiculo`
--

LOCK TABLES `asignacion_vehiculo` WRITE;
/*!40000 ALTER TABLE `asignacion_vehiculo` DISABLE KEYS */;
INSERT INTO `asignacion_vehiculo` VALUES (1,1,6,'2026-07-01 00:00:00','2026-07-24 00:00:00',NULL,'Norte','sale en buenas condiciones','Activo'),(2,5,5,'2026-07-01 00:00:00','2026-07-11 00:00:00','2026-07-02 02:02:09','Norte','nada','Finalizado');
/*!40000 ALTER TABLE `asignacion_vehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
INSERT INTO `auditoria` VALUES (1,1,'chofer',11,'CREAR','2026-07-01','15:22:52',NULL,'{\"nombre\":\"Exequiel\",\"apellido\":\"Juarez\",\"dni\":\"39367819\"}','Alta de chofer: Exequiel Juarez'),(2,1,'mantenimiento',1,'CREAR','2026-07-01','15:30:28',NULL,'{\"id_mantenimiento\":1,\"id_vehiculo\":\"1\",\"id_usuario\":1,\"fecha_inicio\":\"2026-07-01\",\"tipo_servicio\":\"cambio de aceite\",\"estado\":\"Realizado\",\"km_servicio\":87000,\"proximo_km\":95000,\"descripcion\":\"cambio de aceite\",\"observaciones\":\"aceite malo\",\"costo_repuestos\":11500,\"mano_obra\":40000,\"costo_total\":51500}','Alta de mantenimiento (cambio de aceite) para vehículo ID: 1'),(3,1,'mantenimiento',2,'CREAR','2026-07-01','15:32:55',NULL,'{\"id_mantenimiento\":2,\"id_vehiculo\":\"1\",\"id_usuario\":1,\"fecha_inicio\":\"2026-07-01\",\"tipo_servicio\":\"cambio de aceite\",\"estado\":\"En proceso\",\"km_servicio\":124000,\"proximo_km\":140000,\"descripcion\":\"cambio de aceite\",\"observaciones\":\"cambio de aceite\",\"costo_repuestos\":35000,\"mano_obra\":30000,\"costo_total\":65000}','Alta de mantenimiento (cambio de aceite) para vehículo ID: 1'),(4,1,'vehiculo',1,'EDITAR','2026-07-01','15:34:29','{\"id_vehiculo\":1,\"patente\":\"AA001BB\",\"legajo\":null,\"marca\":\"Toyota\",\"modelo\":\"Hilux\",\"anio\":2019,\"id_tipo\":1,\"num_chasis\":\"CHS-001\",\"num_motor\":\"MOT-001\",\"transmision\":null,\"km_actual\":87000,\"cedula_numero\":\"CED-001\",\"cedula_titular\":\"Municipalidad Capital\",\"seguro_compania\":\"Federación Patronal\",\"seguro_vencimiento\":\"2027-03-15\",\"rto_vencimiento\":\"2026-09-10\",\"estado_actual\":\"En mantenimiento\",\"distrito\":\"Centro\",\"area\":null,\"observaciones\":null,\"imagen_url\":null,\"fecha_alta\":\"2023-01-10\",\"fecha_baja\":null,\"foto_cedula\":\"cedula.jpg\",\"foto_titulo\":null,\"foto_rto\":null}','{\"estado_actual\":\"Disponible\",\"km_actual\":\"87000\",\"distrito\":\"Centro\",\"observaciones\":\"\",\"fecha_baja\":null,\"cedula_numero\":\"CED-001\",\"cedula_titular\":\"Municipalidad Capital\",\"seguro_compania\":\"Federación Patronal\",\"seguro_vencimiento\":\"2027-03-15\",\"rto_vencimiento\":\"2026-09-10\"}','Edición de vehículo ID: 1'),(5,1,'mantenimiento',3,'CREAR','2026-07-01','15:58:36',NULL,'{\"id_mantenimiento\":3,\"id_vehiculo\":\"3\",\"id_usuario\":1,\"fecha_inicio\":\"2026-07-01\",\"tipo_servicio\":\"cambio de aceite\",\"estado\":\"En proceso\",\"km_servicio\":45000,\"proximo_km\":60000,\"descripcion\":\"cambio de aceite\",\"observaciones\":\"cambio de aceite\",\"costo_repuestos\":38000,\"mano_obra\":30000,\"costo_total\":68000}','Alta de mantenimiento (cambio de aceite) para vehículo ID: 3'),(6,1,'mantenimiento',3,'EDITAR','2026-07-01','15:59:08','{\"estado\":\"En proceso\"}','{\"estado\":\"Realizado\"}','Cambio de estado de mantenimiento ID: 3 (En proceso → Realizado)'),(7,1,'mantenimiento',4,'CREAR','2026-07-01','16:00:56',NULL,'{\"id_mantenimiento\":4,\"id_vehiculo\":\"3\",\"id_usuario\":1,\"fecha_inicio\":\"2026-07-01\",\"tipo_servicio\":\"cambio de aceite\",\"estado\":\"En proceso\",\"km_servicio\":45000,\"proximo_km\":50000,\"descripcion\":\"cambio de aceite\",\"observaciones\":\"cambio de aceite\",\"costo_repuestos\":9500,\"mano_obra\":30000,\"costo_total\":39500}','Alta de mantenimiento (cambio de aceite) para vehículo ID: 3'),(8,1,'mantenimiento',2,'EDITAR','2026-07-01','16:01:06','{\"estado\":\"En proceso\"}','{\"estado\":\"Realizado\"}','Cambio de estado de mantenimiento ID: 2 (En proceso → Realizado)'),(9,1,'mantenimiento',4,'EDITAR','2026-07-01','16:01:25','{\"estado\":\"En proceso\"}','{\"estado\":\"Realizado\"}','Cambio de estado de mantenimiento ID: 4 (En proceso → Realizado)'),(10,1,'mantenimiento',5,'CREAR','2026-07-01','16:02:38',NULL,'{\"id_mantenimiento\":5,\"id_vehiculo\":\"3\",\"id_usuario\":1,\"fecha_inicio\":\"2026-07-01\",\"tipo_servicio\":\"cambio de aceite\",\"estado\":\"En proceso\",\"km_servicio\":45000,\"proximo_km\":56000,\"descripcion\":\"filtros\",\"observaciones\":\"filtros\",\"costo_repuestos\":75000,\"mano_obra\":40000,\"costo_total\":115000}','Alta de mantenimiento (cambio de aceite) para vehículo ID: 3'),(11,1,'usuario',4,'CREAR','2026-07-01','16:12:42',NULL,'{\"nombre\":\"Exequiel\",\"apellido\":\"Juarez\",\"nombre_usuario\":\"ExeJuarez\",\"id_rol\":\"3\",\"permisos\":\"Vehicles,Choferes,Mantenimientos,Alertas,Reportes,Siniestros\",\"activo\":true}','Alta usuario: Exequiel Juarez (ExeJuarez)'),(12,1,'vehiculo',2,'EDITAR','2026-07-01','16:34:38',NULL,'{\"km_actual\":\"124000\"}','Actualización de kilometraje del vehículo ID: 2 a 124000 km'),(13,1,'vehiculo',2,'EDITAR','2026-07-01','16:48:29','{\"id_vehiculo\":2,\"patente\":\"AB002CC\",\"legajo\":null,\"marca\":\"Ford\",\"modelo\":\"Ranger\",\"anio\":2020,\"id_tipo\":1,\"num_chasis\":\"CHS-002\",\"num_motor\":\"MOT-002\",\"transmision\":null,\"km_actual\":124000,\"cedula_numero\":\"CED-002\",\"cedula_titular\":\"Municipalidad Capital\",\"seguro_compania\":\"San Cristóbal\",\"seguro_vencimiento\":\"2026-07-06\",\"rto_vencimiento\":null,\"estado_actual\":\"Disponible\",\"distrito\":\"Norte\",\"area\":null,\"observaciones\":null,\"imagen_url\":null,\"fecha_alta\":\"2023-03-15\",\"fecha_baja\":null,\"foto_cedula\":\"cedula.jpg\",\"foto_titulo\":null,\"foto_rto\":null}','{\"estado_actual\":\"Baja\",\"km_actual\":\"124000\",\"distrito\":\"Norte\",\"observaciones\":\"\",\"fecha_baja\":null,\"cedula_numero\":\"CED-002\",\"cedula_titular\":\"Municipalidad Capital\",\"seguro_compania\":\"San Cristóbal\",\"seguro_vencimiento\":\"2026-07-06\",\"rto_vencimiento\":null}','Edición de vehículo ID: 2'),(14,1,'vehiculo',11,'CREAR','2026-07-01','17:18:40',NULL,'{\"id_vehiculo\":11,\"patente\":\"PPKEE2\",\"id_tipo\":\"1\",\"marca\":\"Ford\",\"modelo\":\"Ranger\",\"anio\":\"2017\",\"num_chasis\":\"2323234343\",\"num_motor\":\"456421321646546541346543\",\"transmision\":\"Manual\",\"estado_actual\":\"Disponible\",\"km_actual\":\"15000\",\"distrito\":\"Centro \",\"fecha_alta\":\"2026-07-06\",\"cedula_numero\":\"1234568943\",\"cedula_titular\":\"Municipalidad Capital\",\"seguro_compania\":\"Federacion Patronal\",\"seguro_vencimiento\":\"2026-07-03\",\"rto_vencimiento\":\"2026-07-31\",\"foto_cedula\":\"vehiculo-1782937119925.jpg\",\"foto_titulo\":\"vehiculo-1782937120014.png\",\"foto_rto\":\"vehiculo-1782937120017.png\"}','Alta vehículo: Ford Ranger (PPKEE2)'),(15,1,'vehiculo',5,'EDITAR','2026-07-01','23:04:08',NULL,'{\"km_actual\":\"315000\"}','Actualización de kilometraje del vehículo ID: 5 a 315000 km'),(16,1,'mantenimiento',5,'EDITAR','2026-07-01','23:05:12','{\"estado\":\"En proceso\"}','{\"estado\":\"Realizado\"}','Cambio de estado de mantenimiento ID: 5 (En proceso → Realizado)');
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chofer`
--

DROP TABLE IF EXISTS `chofer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `foto_documento` varchar(255) DEFAULT NULL,
  `motivoBaja` text DEFAULT NULL,
  PRIMARY KEY (`id_chofer`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chofer`
--

LOCK TABLES `chofer` WRITE;
/*!40000 ALTER TABLE `chofer` DISABLE KEYS */;
INSERT INTO `chofer` VALUES (1,'Carlos','Rodríguez','28111222','3854100001','Av. Libertad 123, Capital','Activo','1985-03-12','2020-01-05','carlos@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL),(2,'Sergio','Villalba','30222333','3854100002','San Martín 456, Capital','Activo','1988-07-24','2019-06-10','sergio@muni.gov','Tarde','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL),(3,'Marcelo','Paz','32333444','3854100003','Belgrano 789, Banda','Activo','1990-11-05','2021-03-01','marcelo@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL),(4,'Diego','Herrera','25444555','3854100004','Rivadavia 321, Capital','Activo','1982-01-30','2018-08-15','diego@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL),(5,'Roberto','Leiva','35555666','3854100005','Sarmiento 654, Banda','Activo','1992-05-18','2022-02-20','roberto@muni.gov','Tarde','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL),(6,'Fernando','Gutiérrez','27666777','3854100006','Tucumán 987, Capital','Activo','1983-09-07','2017-11-01','fernando@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL),(7,'Pablo','Soria','38777888','3854100007','Córdoba 147, Capital','De Licencia','1995-02-14','2023-01-10','pablo@muni.gov','Tarde','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL),(8,'Alejandro','Medina','31888999','3854100008','Mitre 258, Banda','Activo','1987-06-22','2020-05-18','alejandro@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL),(9,'Gustavo','Ríos','29999000','3854100009','Independencia 369, Capital','Activo','1984-10-03','2016-09-05','gustavo@muni.gov','Tarde','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL),(10,'Raúl','Cabrera','33000111','3854100010','Las Heras 741, Capital','Inactivo','1979-12-28','2015-04-12','raul@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL),(11,'Exequiel','Juarez','39367819','37891738290','mzn a lote 6','Activo','2002-01-01','2026-07-01','ejemplo@gmail.com','Tarde/Noche','2026-07-01 18:22:52','2026-07-01 18:22:52','chofer-1782930172929.jpg',NULL);
/*!40000 ALTER TABLE `chofer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_mantenimiento`
--

DROP TABLE IF EXISTS `detalle_mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_mantenimiento`
--

LOCK TABLES `detalle_mantenimiento` WRITE;
/*!40000 ALTER TABLE `detalle_mantenimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `distritos`
--

DROP TABLE IF EXISTS `distritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `distritos` VALUES (1,'Centro '),(2,'Norte'),(3,'Sur');
/*!40000 ALTER TABLE `distritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentacion`
--

DROP TABLE IF EXISTS `documentacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentacion`
--

LOCK TABLES `documentacion` WRITE;
/*!40000 ALTER TABLE `documentacion` DISABLE KEYS */;
INSERT INTO `documentacion` VALUES (1,1,'DNI Titular','2020-01-01',NULL,'dni.jpg','Vigente'),(2,1,'Póliza de Seguro','2026-03-15','2027-03-15','seguro.png','Vigente'),(3,4,'DNI Titular','2019-05-10',NULL,'dni.jpg','Vigente'),(4,4,'Póliza de Seguro','2026-01-20','2027-01-20','seguro.png','Vigente'),(5,6,'DNI Titular','2018-04-01',NULL,'dni.jpg','Vigente'),(6,6,'Póliza de Seguro','2025-04-10','2026-04-10','seguro.png','Vencida'),(7,8,'DNI Titular','2021-07-12',NULL,'dni.jpg','Vigente'),(8,8,'Póliza de Seguro','2025-03-20','2026-03-20','seguro.png','Vencida'),(9,10,'DNI Titular','2023-01-08',NULL,'dni.jpg','Vigente'),(10,10,'Póliza de Seguro','2024-12-01','2025-12-01','seguro.png','Vencida');
/*!40000 ALTER TABLE `documentacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `herramienta`
--

DROP TABLE IF EXISTS `herramienta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `herramienta` VALUES (2,'HTI-002','Amoladora','Construcción A','Disponible',2,'Energia','Se encuentran en buen estado','Sin título.jpg','2026-05-11 03:08:56'),(3,'HTI-003','Destornillador percutor','Taller Mecánico','En uso',1,'Energia','Prueba 3','','2026-05-12 00:30:35'),(4,'HTI-001','Amoladora Angular Bosch 4.5\"','Taller Mecánico','Disponible',3,NULL,NULL,NULL,'0000-00-00 00:00:00'),(5,'HTI-004','Gato Hidráulico 20T','Depósito Central','Disponible',4,NULL,NULL,NULL,'0000-00-00 00:00:00'),(6,'HTI-005','Caja de Tubos Mando 1/2 (Juego)','Mantenimiento General','Disponible',5,NULL,NULL,NULL,'0000-00-00 00:00:00'),(9,'HTI-006','Soldadora Inverter 200A','Taller Mecánico','Disponible',2,NULL,NULL,NULL,'2024-01-10 00:00:00'),(10,'HTI-007','Hidrolavadora Industrial 150 Bar','Mantenimiento General','En Reparación',1,NULL,NULL,NULL,'2023-11-05 00:00:00'),(11,'HTI-008','Compresor de Aire 50L','Taller Mecánico','Disponible',3,NULL,NULL,NULL,'2023-08-20 00:00:00'),(12,'HTI-009','Sierra Circular 7 1/4\"','Construcción A','Disponible',2,NULL,NULL,NULL,'2024-03-15 00:00:00'),(13,'HTI-010','Llave Dinamométrica 1/2\"','Taller Mecánico','Disponible',4,NULL,NULL,NULL,'2023-06-30 00:00:00'),(14,'HTI-011','Cortadora de Césped Naftera','Espacios Verdes','Disponible',5,NULL,NULL,NULL,'2023-09-12 00:00:00'),(15,'HTI-012','Motosierra Stihl MS170','Espacios Verdes','En Reparación',3,NULL,NULL,NULL,'2024-02-28 00:00:00'),(16,'HTI-013','Taladro de Banco 16mm','Taller Mecánico','Disponible',1,NULL,NULL,NULL,'2023-05-14 00:00:00'),(17,'HTI-014','Hormigonera 130L','Construcción A','Disponible',4,NULL,NULL,NULL,'2024-04-10 00:00:00'),(18,'HTI-015','Escalera de Aluminio 12 Escalones','Mantenimiento General','Disponible',6,NULL,NULL,NULL,'2023-12-01 00:00:00');
/*!40000 ALTER TABLE `herramienta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_km`
--

DROP TABLE IF EXISTS `historial_km`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_km`
--

LOCK TABLES `historial_km` WRITE;
/*!40000 ALTER TABLE `historial_km` DISABLE KEYS */;
INSERT INTO `historial_km` VALUES (1,1,70000,78000,'2024-08-15','Actualización mensual rutinaria'),(2,1,78000,83000,'2024-10-20','Regreso de comisión distrito sur'),(3,1,83000,87000,'2024-12-05','Actualización fin de año'),(4,2,98000,107000,'2024-07-10','Viaje a Guayamba'),(5,2,107000,115000,'2024-09-18','Obras distrito norte'),(6,2,115000,121000,'2024-11-30','Relevamiento campo'),(7,2,121000,124000,'2025-01-14','Actualización trimestral'),(8,3,30000,38000,'2024-09-05','Control rutinario'),(9,3,38000,45000,'2025-02-20','Comisión inter-distrital'),(10,5,270000,288000,'2024-06-01','Transporte de materiales'),(11,5,288000,301000,'2024-08-22','Obras viales norte'),(12,5,301000,310000,'2024-11-10','Fin de temporada obras'),(13,8,58000,65000,'2024-10-03','Actualización después de comisión'),(14,8,65000,73000,'2025-03-18','Relevamiento zona sur'),(15,2,124000,124000,'2026-07-01','actualizacion'),(16,5,310000,315000,'2026-07-02','nose');
/*!40000 ALTER TABLE `historial_km` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `licencia_chofer`
--

DROP TABLE IF EXISTS `licencia_chofer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `licencia_chofer`
--

LOCK TABLES `licencia_chofer` WRITE;
/*!40000 ALTER TABLE `licencia_chofer` DISABLE KEYS */;
INSERT INTO `licencia_chofer` VALUES (1,1,'LIC-00001','C','2023-01-10','2028-01-10','licencia.jpg'),(2,4,'LIC-00004','B2','2024-06-01','2027-06-01','licencia.jpg'),(3,8,'LIC-00008','C','2022-09-15','2027-09-15','licencia.jpg'),(4,2,'LIC-00002','B2','2021-07-06','2026-07-06','licencia.jpg'),(5,3,'LIC-00003','C','2021-07-04','2026-07-04','licencia.jpg'),(6,5,'LIC-00005','B','2020-01-15','2026-01-15','licencia.jpg'),(7,6,'LIC-00006','C','2019-11-20','2025-11-20','licencia.jpg'),(8,7,'LIC-00007','B2','2020-03-10','2026-03-10','licencia.jpg'),(9,9,'LIC-00009','B','2018-05-05','2025-05-05','licencia.jpg'),(10,10,'LIC-00010','C','2017-08-12','2024-08-12','licencia.jpg'),(11,11,'37283293232','B2','2026-07-01','2026-07-02','chofer-1782930172931.jpg');
/*!40000 ALTER TABLE `licencia_chofer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimiento`
--

DROP TABLE IF EXISTS `mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento`
--

LOCK TABLES `mantenimiento` WRITE;
/*!40000 ALTER TABLE `mantenimiento` DISABLE KEYS */;
INSERT INTO `mantenimiento` VALUES (1,1,1,'cambio de aceite','2026-07-01',NULL,87000,51500.00,'cambio de aceite','aceite malo',95000,NULL,'Realizado',40000.00,11500.00),(2,1,1,'cambio de aceite','2026-07-01',NULL,124000,65000.00,'cambio de aceite','cambio de aceite',140000,NULL,'Realizado',30000.00,35000.00),(3,3,1,'cambio de aceite','2026-07-01',NULL,45000,68000.00,'cambio de aceite','cambio de aceite',60000,NULL,'Realizado',30000.00,38000.00),(4,3,1,'cambio de aceite','2026-07-01',NULL,45000,39500.00,'cambio de aceite','cambio de aceite',50000,NULL,'Realizado',30000.00,9500.00),(5,3,1,'cambio de aceite','2026-07-01',NULL,45000,115000.00,'filtros','filtros',56000,NULL,'Realizado',40000.00,75000.00);
/*!40000 ALTER TABLE `mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_stock`
--

DROP TABLE IF EXISTS `movimiento_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `operarios` VALUES (1,'Hernán Quiroga','Activo'),(2,'Marcos Díaz','Activo'),(5,'Gomez Juan','Activo');
/*!40000 ALTER TABLE `operarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestamo`
--

DROP TABLE IF EXISTS `prestamo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `prestamo` VALUES (3,2,'Gomez Juan','2026-05-11 00:00:00','2026-05-20 00:00:00','2026-05-11 03:10:00','Espacios Verdes','Finalizado'),(4,2,'Juan Pérez','2026-05-12 00:00:00','2026-06-20 00:00:00','2026-05-11 03:10:44','Taller Central','Finalizado'),(5,3,'Gomez Juan','2026-05-11 00:00:00','2026-06-30 00:00:00',NULL,'Construcción A','Activo');
/*!40000 ALTER TABLE `prestamo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repuesto`
--

DROP TABLE IF EXISTS `repuesto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `repuesto` VALUES (1,'Filtro de aceite','Filtro para motor','unidad',20,5),(2,'Aceite 15W40','Aceite lubricante','litro',50,10),(3,'Pastillas de freno','Juego delantero','juego',15,3),(4,'Correa de distribución','Correa motor','unidad',8,2);
/*!40000 ALTER TABLE `repuesto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repuestos`
--

DROP TABLE IF EXISTS `repuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `repuestos` VALUES (1,'Filtro de Aceite (Universal)',14,6500.00),(2,'Aceite Sintético 10W40 (1 Litro)',30,8000.00),(4,'Filtro de aire ',15,15000.00),(5,'Pastillade freno ',12,8000.00),(6,'Filtro de Aceite (Camioneta)',25,8500.00),(7,'Filtro de Aire (Camión)',12,14000.00),(8,'Filtro de Combustible (Diesel)',18,11500.00),(9,'Aceite Motor 15W40 (Tambor 20L)',8,85000.00),(10,'Aceite Sintético 5W30 (1L)',45,9500.00),(11,'Pastillas de Freno (Juego Delantero)',10,35000.00),(12,'Batería 12V 75Ah',5,120000.00),(13,'Amortiguador Delantero (Par)',4,185000.00),(14,'Bomba de Agua (Diesel)',6,75000.00),(15,'Kit de Embrague Completo',3,320000.00),(16,'Óptica Trasera Izquierda',15,45000.00),(17,'Espejo Retrovisor Derecho',10,38000.00),(18,'Cruceta de Cardán',22,18000.00),(19,'Inyector Common Rail',8,150000.00),(20,'Filtro de Habitáculo',40,6500.00),(21,'Correa Poly-V',30,22000.00),(22,'Bomba de Freno',5,85000.00);
/*!40000 ALTER TABLE `repuestos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `rol` VALUES (1,'Administrador','Acceso total al sistema','Vehicles'),(2,'Jefe de Taller','Acceso a mantenimientos, repuestos y herramientas','Vehicles'),(3,'Principal','Acceso de supervisión general y reportes','Vehicles,Choferes');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sectores`
--

DROP TABLE IF EXISTS `sectores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `sectores` VALUES (2,'Construcción A'),(3,'Taller Mecánico'),(6,'Espacios Verdes');
/*!40000 ALTER TABLE `sectores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siniestro`
--

DROP TABLE IF EXISTS `siniestro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `id_chofer` int(11) DEFAULT NULL,
  `danos_vehiculo` text DEFAULT NULL,
  `tercero_vehiculo` varchar(100) DEFAULT NULL,
  `tercero_seguro` varchar(100) DEFAULT NULL,
  `tercero_conductor` varchar(100) DEFAULT NULL,
  `tercero_contacto` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_siniestro`),
  KEY `id_vehiculo` (`id_vehiculo`),
  CONSTRAINT `siniestro_ibfk_1` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculo` (`id_vehiculo`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siniestro`
--

LOCK TABLES `siniestro` WRITE;
/*!40000 ALTER TABLE `siniestro` DISABLE KEYS */;
/*!40000 ALTER TABLE `siniestro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_vehiculo`
--

DROP TABLE IF EXISTS `tipo_vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
INSERT INTO `tipo_vehiculo` VALUES (1,'Camioneta'),(2,'Camión'),(3,'Maquinaria Pesada'),(4,'Utilitario'),(5,'Auto'),(6,'Motocicleta'),(7,'Camioneta'),(8,'Camión');
/*!40000 ALTER TABLE `tipo_vehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'admin','$2b$10$9eCklbUJ0HhkoHQ1cHT6YOJ6xSg5S4F9G8P17lqKlmMgmOPBTJh1G','Administrador','Sistema',1,1,'Vehicles,Choferes,Mantenimientos,Tools,Usuarios,Auditoria'),(2,'carlos_oficina','$2b$10$TUCOaKrHUOH6RVJoyK2vsuJvbC2hvni.6A7SxSQ.5A4EXuDPS54bi','Carlos ','Gerez ',1,3,'Vehicles,Choferes,Auditoria'),(3,'walter','$2b$10$SIlilzbVXicCXm748lXyRuMO2zgXy1We2ucD8F7iehBvbyoJw0Ley','Walter Daniel','Gueleb',1,2,'Choferes,Mantenimientos,Auditoria'),(4,'ExeJuarez','$2b$10$R/PH6VLNiweA2OVi7LoCHuXm.CPLQgkzRUJGussSq.okx2bFgJ2ze','Exequiel','Juarez',1,3,'Vehicles,Choferes,Mantenimientos,Alertas,Reportes,Siniestros');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehiculo`
--

DROP TABLE IF EXISTS `vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `foto_cedula` varchar(255) DEFAULT NULL,
  `foto_titulo` varchar(255) DEFAULT NULL,
  `foto_rto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_vehiculo`),
  UNIQUE KEY `patente` (`patente`),
  UNIQUE KEY `legajo` (`legajo`),
  KEY `fk_vehiculo_tipo` (`id_tipo`),
  KEY `idx_vehiculo_patente` (`patente`),
  KEY `idx_vehiculo_estado` (`estado_actual`),
  CONSTRAINT `fk_vehiculo_tipo` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_vehiculo` (`id_tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiculo`
--

LOCK TABLES `vehiculo` WRITE;
/*!40000 ALTER TABLE `vehiculo` DISABLE KEYS */;
INSERT INTO `vehiculo` VALUES (1,'AA001BB',NULL,'Toyota','Hilux',2019,1,'CHS-001','MOT-001',NULL,NULL,87000,'CED-001','Municipalidad Capital','Federación Patronal','2027-03-15','2026-09-10','En uso','Centro',NULL,'',NULL,'2023-01-10',NULL,'cedula.jpg',NULL,NULL),(2,'AB002CC',NULL,'Ford','Ranger',2020,1,'CHS-002','MOT-002',NULL,NULL,124000,'CED-002','Municipalidad Capital','San Cristóbal','2026-07-06',NULL,'Baja','Norte',NULL,'',NULL,'2023-03-15',NULL,'cedula.jpg',NULL,NULL),(3,'AC003DD',NULL,'Volkswagen','Amarok',2021,1,'CHS-003','MOT-003',NULL,NULL,45000,'CED-003','Municipalidad Capital','La Caja','2026-07-04','2026-07-03','Disponible','Sur',NULL,NULL,NULL,'2023-06-01',NULL,'cedula.jpg',NULL,NULL),(4,'AD004EE',NULL,'Chevrolet','S-10',2018,1,'CHS-004','MOT-004',NULL,NULL,198000,'CED-004','Municipalidad Capital','Federación Patronal','2027-01-20','2027-01-20','Disponible','Centro',NULL,NULL,NULL,'2022-11-20',NULL,'cedula.jpg',NULL,NULL),(5,'AE005FF',NULL,'Mercedes-Benz','Tector',2020,2,'CHS-005','MOT-005',NULL,NULL,315000,'CED-005','Municipalidad Capital','San Cristóbal','2026-07-05',NULL,'Disponible','Norte',NULL,NULL,NULL,'2022-08-05',NULL,'cedula.jpg',NULL,NULL),(6,'AF006GG',NULL,'Scania','R410',2019,2,'CHS-006','MOT-006',NULL,NULL,415000,'CED-006','Municipalidad Capital','Rivadavia Seguros','2026-04-10','2026-11-15','Disponible','Sur',NULL,NULL,NULL,'2022-05-18',NULL,'cedula.jpg',NULL,NULL),(7,'AG007HH',NULL,'Iveco','Tector 170E28',2022,2,'CHS-007','MOT-007',NULL,NULL,62000,'CED-007','Municipalidad Capital','Zurich','2026-05-01',NULL,'Disponible','Centro',NULL,NULL,NULL,'2023-09-01',NULL,'cedula.jpg',NULL,NULL),(8,'AH008II',NULL,'Nissan','Frontier',2021,1,'CHS-008','MOT-008',NULL,NULL,73000,'CED-008','Municipalidad Capital','Mapfre','2026-03-20','2026-08-05','Disponible','Norte',NULL,NULL,NULL,'2023-07-12',NULL,'cedula.jpg',NULL,NULL),(9,'AI009JJ',NULL,'Renault','Kangoo',2020,4,'CHS-009','MOT-009',NULL,NULL,55000,'CED-009','Municipalidad Capital','Sancor Seguros','2026-02-14',NULL,'Disponible','Sur',NULL,NULL,NULL,'2023-04-22',NULL,'cedula.jpg',NULL,NULL),(10,'AJ010KK',NULL,'Ford','Transit',2023,4,'CHS-010','MOT-010',NULL,NULL,18000,'CED-010','Municipalidad Capital','La Segunda','2025-12-01','2026-10-20','Disponible','Centro',NULL,NULL,NULL,'2024-01-08',NULL,'cedula.jpg',NULL,NULL),(11,'PPKEE2',NULL,'Ford','Ranger',2017,1,'2323234343','456421321646546541346543',NULL,'Manual',15000,'1234568943','Municipalidad Capital','Federacion Patronal','2026-07-03','2026-07-31','Disponible','Centro ',NULL,NULL,NULL,'2026-07-06',NULL,'vehiculo-1782937119925.jpg','vehiculo-1782937120014.png','vehiculo-1782937120017.png');
/*!40000 ALTER TABLE `vehiculo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-01 23:57:56
