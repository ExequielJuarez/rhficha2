-- ============================================================================
--  Ficha Técnica de Vehículos  ·  Base de datos  vehiculos_db
--  Esquema completo + datos de ejemplo (versión unificada y depurada).
--
--  Uso:   mysql -u root -p < pruebasdb/copiaseguridad.sql
--
--  ATENCIÓN: este script BORRA y vuelve a crear la base `vehiculos_db`.
--  Usuarios de ejemplo (todos con la contraseña temporal  Ficha2026! ):
--      admin · carlos_oficina · walter · ExeJuarez
--  Cambiá las contraseñas apenas ingreses (Usuarios > Editar).
--  La tabla `sessions` (sesiones de login) la crea la aplicación sola.
-- ============================================================================

DROP DATABASE IF EXISTS `vehiculos_db`;
CREATE DATABASE `vehiculos_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `vehiculos_db`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
--  Roles y usuarios
-- ---------------------------------------------------------------------------
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `permisos` varchar(255) DEFAULT 'Vehicles',
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uq_rol_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  Catálogos
-- ---------------------------------------------------------------------------
CREATE TABLE `tipo_vehiculo` (
  `id_tipo` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  PRIMARY KEY (`id_tipo`),
  UNIQUE KEY `uq_tipo_descripcion` (`descripcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `distritos` (
  `id_distrito` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_distrito`),
  UNIQUE KEY `uq_distrito_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sectores` (
  `id_sector` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_sector`),
  UNIQUE KEY `uq_sector_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `operarios` (
  `id_operario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado` varchar(50) DEFAULT 'Activo',
  PRIMARY KEY (`id_operario`),
  UNIQUE KEY `uq_operario_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  Vehículos
-- ---------------------------------------------------------------------------
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
  UNIQUE KEY `uq_vehiculo_chasis` (`num_chasis`),
  UNIQUE KEY `uq_vehiculo_motor` (`num_motor`),
  UNIQUE KEY `uq_vehiculo_cedula` (`cedula_numero`),
  KEY `fk_vehiculo_tipo` (`id_tipo`),
  KEY `idx_vehiculo_estado` (`estado_actual`),
  CONSTRAINT `fk_vehiculo_tipo` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_vehiculo` (`id_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  Choferes
-- ---------------------------------------------------------------------------
CREATE TABLE `chofer` (
  `id_chofer` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'Activo',
  `fechaNacimiento` date DEFAULT NULL,
  `fechaIngreso` date DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `turno` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `foto_documento` varchar(255) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `motivoBaja` text DEFAULT NULL,
  PRIMARY KEY (`id_chofer`),
  UNIQUE KEY `dni` (`dni`),
  UNIQUE KEY `uq_chofer_telefono` (`telefono`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  Mantenimientos y repuestos
-- ---------------------------------------------------------------------------
CREATE TABLE `repuestos` (
  `id_repuesto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `costo_unitario` decimal(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id_repuesto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `mantenimiento` (
  `id_mantenimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo_servicio` varchar(100) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `km_servicio` int(11) NOT NULL,
  `costo_total` decimal(12,2) DEFAULT 0.00,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `detalle_mantenimiento` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_mantenimiento` int(11) NOT NULL,
  `id_repuesto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `costo_unitario` decimal(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_det_mant` (`id_mantenimiento`),
  KEY `fk_det_repuesto` (`id_repuesto`),
  CONSTRAINT `fk_det_mant` FOREIGN KEY (`id_mantenimiento`) REFERENCES `mantenimiento` (`id_mantenimiento`),
  CONSTRAINT `fk_det_repuesto` FOREIGN KEY (`id_repuesto`) REFERENCES `repuestos` (`id_repuesto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  Herramientas y préstamos
-- ---------------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `prestamo` (
  `id_prestamo` int(11) NOT NULL AUTO_INCREMENT,
  `id_herramienta` int(11) NOT NULL,
  `nombre_operario` varchar(100) NOT NULL,
  `fecha_salida` datetime NOT NULL,
  `fecha_devolucion_estimada` datetime DEFAULT NULL,
  `fecha_devolucion_real` datetime DEFAULT NULL,
  `sector_destino` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado_prestamo` varchar(50) NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_prestamo`),
  KEY `fk_prestamo_herramienta` (`id_herramienta`),
  KEY `idx_prestamo_estado` (`estado_prestamo`),
  CONSTRAINT `fk_prestamo_herramienta` FOREIGN KEY (`id_herramienta`) REFERENCES `herramienta` (`id_herramienta`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  Siniestros
-- ---------------------------------------------------------------------------
CREATE TABLE `siniestro` (
  `id_siniestro` int(11) NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int(11) NOT NULL,
  `id_chofer` int(11) DEFAULT NULL,
  `chofer_involucrado` varchar(100) DEFAULT NULL,
  `fecha_siniestro` date NOT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `relato` text DEFAULT NULL,
  `danos_vehiculo` text DEFAULT NULL,
  `tercero_vehiculo` varchar(100) DEFAULT NULL,
  `tercero_seguro` varchar(100) DEFAULT NULL,
  `tercero_conductor` varchar(100) DEFAULT NULL,
  `tercero_contacto` varchar(100) DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'EN PROCESO',
  `archivos_adjuntos` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_siniestro`),
  KEY `id_vehiculo` (`id_vehiculo`),
  KEY `fk_siniestro_chofer` (`id_chofer`),
  CONSTRAINT `siniestro_ibfk_1` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculo` (`id_vehiculo`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_siniestro_chofer` FOREIGN KEY (`id_chofer`) REFERENCES `chofer` (`id_chofer`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  Alertas y auditoría
-- ---------------------------------------------------------------------------
CREATE TABLE `alerta` (
  `id_alerta` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` enum('licencia_vencida','licencia_proxima','mantenimiento_pendiente','mantenimiento_finalizado','mantenimiento_proximo','mantenimiento_vencido','documentacion_vencida','vehiculo_fuera_servicio','vehiculo_en_mantenimiento','herramienta_devuelta','prestamo_vencido','siniestro_activo','critica','informativa') NOT NULL,
  `prioridad` enum('alta','media','baja') NOT NULL DEFAULT 'media',
  `mensaje` varchar(255) NOT NULL,
  `entidad_tipo` varchar(50) DEFAULT NULL,
  `entidad_id` int(11) DEFAULT NULL,
  `entidad_nombre` varchar(100) DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `generada_automaticamente` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id_alerta`),
  KEY `idx_alerta_entidad` (`entidad_tipo`,`entidad_id`),
  KEY `idx_alerta_leida` (`leida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
--  DATOS
-- ============================================================================

INSERT INTO `rol` (`id_rol`,`nombre`,`descripcion`,`permisos`) VALUES
 (1,'Administrador','Acceso total al sistema','Vehicles,Choferes,Mantenimientos,Tools,Alertas,Reportes,Usuarios,Roles,Auditoria,Siniestros'),
 (2,'Jefe de Taller','Acceso a mantenimientos, repuestos y herramientas','Vehicles,Mantenimientos,Tools,Alertas'),
 (3,'Principal','Acceso de supervisión general y reportes','Vehicles,Choferes,Reportes,Alertas,Siniestros');

-- Contraseña temporal de todos los usuarios de ejemplo:  Ficha2026!
INSERT INTO `usuario` (`id_usuario`,`nombre_usuario`,`contrasena`,`nombre`,`apellido`,`activo`,`id_rol`,`permisos`) VALUES
 (1,'admin','$2b$10$jM.MTLrReit4A2InHkbQ9eSpc5t/V0GsuXjgrCyNgACwuHmgsdNgu','Administrador','Sistema',1,1,'Vehicles,Choferes,Mantenimientos,Tools,Alertas,Reportes,Usuarios,Roles,Auditoria,Siniestros'),
 (2,'carlos_oficina','$2b$10$jM.MTLrReit4A2InHkbQ9eSpc5t/V0GsuXjgrCyNgACwuHmgsdNgu','Carlos','Gerez',1,3,'Vehicles,Choferes,Auditoria'),
 (3,'walter','$2b$10$jM.MTLrReit4A2InHkbQ9eSpc5t/V0GsuXjgrCyNgACwuHmgsdNgu','Walter Daniel','Gueleb',1,2,'Choferes,Mantenimientos,Auditoria'),
 (4,'ExeJuarez','$2b$10$jM.MTLrReit4A2InHkbQ9eSpc5t/V0GsuXjgrCyNgACwuHmgsdNgu','Exequiel','Juarez',1,3,'Vehicles,Choferes,Mantenimientos,Alertas,Reportes,Siniestros');

INSERT INTO `tipo_vehiculo` (`id_tipo`,`descripcion`) VALUES
 (1,'Camioneta'),(2,'Camión'),(3,'Maquinaria Pesada'),(4,'Utilitario'),(5,'Auto'),(6,'Motocicleta');

INSERT INTO `distritos` (`id_distrito`,`nombre`) VALUES (1,'Centro'),(2,'Norte'),(3,'Sur');

INSERT INTO `sectores` (`id_sector`,`nombre`) VALUES
 (1,'Construcción A'),(2,'Taller Mecánico'),(3,'Espacios Verdes'),(4,'Depósito Central'),(5,'Mantenimiento General');

INSERT INTO `operarios` (`id_operario`,`nombre`,`estado`) VALUES
 (1,'Hernán Quiroga','Activo'),(2,'Marcos Díaz','Activo'),(3,'Gomez Juan','Activo'),(4,'Juan Pérez','Activo');

INSERT INTO `vehiculo` (`id_vehiculo`,`patente`,`legajo`,`marca`,`modelo`,`anio`,`id_tipo`,`num_chasis`,`num_motor`,`combustible`,`transmision`,`km_actual`,`cedula_numero`,`cedula_titular`,`seguro_compania`,`seguro_vencimiento`,`rto_vencimiento`,`estado_actual`,`distrito`,`area`,`observaciones`,`imagen_url`,`fecha_alta`,`fecha_baja`,`foto_cedula`,`foto_titulo`,`foto_rto`) VALUES
 (1,'AA001BB',NULL,'Toyota','Hilux',2019,1,'CHS-001','MOT-001','Diésel','Manual',87000,'CED-001','Municipalidad Capital','Federación Patronal','2027-03-15','2026-10-10','En uso','Centro',NULL,NULL,NULL,'2023-01-10',NULL,'cedula.jpg',NULL,NULL),
 (2,'AB002CC',NULL,'Ford','Ranger',2020,1,'CHS-002','MOT-002','Diésel','Manual',124000,'CED-002','Municipalidad Capital','San Cristóbal','2026-07-06',NULL,'Baja','Norte',NULL,'Dada de baja por siniestro total',NULL,'2023-03-15','2026-07-02','cedula.jpg',NULL,NULL),
 (3,'AC003DD',NULL,'Volkswagen','Amarok',2021,1,'CHS-003','MOT-003','Diésel','Automática',45000,'CED-003','Municipalidad Capital','La Caja','2026-07-04','2026-07-03','Disponible','Sur',NULL,NULL,NULL,'2023-06-01',NULL,'cedula.jpg',NULL,NULL),
 (4,'AD004EE',NULL,'Chevrolet','S-10',2018,1,'CHS-004','MOT-004','Diésel','Manual',198000,'CED-004','Municipalidad Capital','Federación Patronal','2027-01-20','2027-01-20','Disponible','Centro',NULL,NULL,NULL,'2022-11-20',NULL,'cedula.jpg',NULL,NULL),
 (5,'AE005FF',NULL,'Mercedes-Benz','Tector',2020,2,'CHS-005','MOT-005','Diésel','Manual',315000,'CED-005','Municipalidad Capital','San Cristóbal','2026-07-05',NULL,'Disponible','Norte',NULL,NULL,NULL,'2022-08-05',NULL,'cedula.jpg',NULL,NULL),
 (6,'AF006GG',NULL,'Scania','R410',2019,2,'CHS-006','MOT-006','Diésel','Manual',415000,'CED-006','Municipalidad Capital','Rivadavia Seguros','2026-04-10','2026-11-15','Disponible','Sur',NULL,NULL,NULL,'2022-05-18',NULL,'cedula.jpg',NULL,NULL),
 (7,'AG007HH',NULL,'Iveco','Tector 170E28',2022,2,'CHS-007','MOT-007','Diésel','Manual',62000,'CED-007','Municipalidad Capital','Zurich','2026-05-01',NULL,'Disponible','Centro',NULL,NULL,NULL,'2023-09-01',NULL,'cedula.jpg',NULL,NULL),
 (8,'AH008II',NULL,'Nissan','Frontier',2021,1,'CHS-008','MOT-008','Diésel','Manual',73000,'CED-008','Municipalidad Capital','Mapfre','2026-03-20','2026-08-05','Disponible','Norte',NULL,NULL,NULL,'2023-07-12',NULL,'cedula.jpg',NULL,NULL),
 (9,'AI009JJ',NULL,'Renault','Kangoo',2020,4,'CHS-009','MOT-009','Nafta','Manual',55000,'CED-009','Municipalidad Capital','Sancor Seguros','2026-02-14',NULL,'En mantenimiento','Sur',NULL,NULL,NULL,'2023-04-22',NULL,'cedula.jpg',NULL,NULL),
 (10,'AJ010KK',NULL,'Ford','Transit',2023,4,'CHS-010','MOT-010','Diésel','Manual',18000,'CED-010','Municipalidad Capital','La Segunda','2025-12-01','2026-10-20','Disponible','Centro',NULL,NULL,NULL,'2024-01-08',NULL,'cedula.jpg',NULL,NULL),
 (11,'PPKEE2',NULL,'Ford','Ranger',2017,1,'2323234343','456421321646546541346543',NULL,'Manual',15000,'1234568943','Municipalidad Capital','Federacion Patronal','2026-07-03','2026-07-31','Disponible','Centro',NULL,NULL,NULL,'2026-07-01',NULL,'cedula.jpg',NULL,NULL);

INSERT INTO `historial_km` (`id_historial`,`id_vehiculo`,`km_anterior`,`km_nuevo`,`fecha`,`observaciones`) VALUES
 (1,1,70000,78000,'2024-08-15','Actualización mensual rutinaria'),
 (2,1,78000,83000,'2024-10-20','Regreso de comisión distrito sur'),
 (3,1,83000,87000,'2024-12-05','Actualización fin de año'),
 (4,2,98000,107000,'2024-07-10','Viaje a Guayamba'),
 (5,2,107000,115000,'2024-09-18','Obras distrito norte'),
 (6,2,115000,121000,'2024-11-30','Relevamiento campo'),
 (7,2,121000,124000,'2025-01-14','Actualización trimestral'),
 (8,3,30000,38000,'2024-09-05','Control rutinario'),
 (9,3,38000,45000,'2025-02-20','Comisión inter-distrital'),
 (10,5,270000,288000,'2024-06-01','Transporte de materiales'),
 (11,5,288000,301000,'2024-08-22','Obras viales norte'),
 (12,5,301000,310000,'2024-11-10','Fin de temporada obras'),
 (13,8,58000,65000,'2024-10-03','Actualización después de comisión'),
 (14,8,65000,73000,'2025-03-18','Relevamiento zona sur'),
 (15,5,310000,315000,'2026-07-02','Actualización tras finalizar asignación');

INSERT INTO `chofer` (`id_chofer`,`nombre`,`apellido`,`dni`,`telefono`,`direccion`,`estado`,`fechaNacimiento`,`fechaIngreso`,`email`,`turno`,`createdAt`,`updatedAt`,`foto_documento`,`imagen`,`motivoBaja`) VALUES
 (1,'Carlos','Rodríguez','28111222','3854100001','Av. Libertad 123, Capital','Activo','1985-03-12','2020-01-05','carlos@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL,NULL),
 (2,'Sergio','Villalba','30222333','3854100002','San Martín 456, Capital','Activo','1988-07-24','2019-06-10','sergio@muni.gov','Tarde','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL,NULL),
 (3,'Marcelo','Paz','32333444','3854100003','Belgrano 789, Banda','Activo','1990-11-05','2021-03-01','marcelo@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL,NULL),
 (4,'Diego','Herrera','25444555','3854100004','Rivadavia 321, Capital','Activo','1982-01-30','2018-08-15','diego@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL,NULL),
 (5,'Roberto','Leiva','35555666','3854100005','Sarmiento 654, Banda','Activo','1992-05-18','2022-02-20','roberto@muni.gov','Tarde','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL,NULL),
 (6,'Fernando','Gutiérrez','27666777','3854100006','Tucumán 987, Capital','Activo','1983-09-07','2017-11-01','fernando@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL,NULL),
 (7,'Pablo','Soria','38777888','3854100007','Córdoba 147, Capital','Licencia Vacaciones/Medica','1995-02-14','2023-01-10','pablo@muni.gov','Tarde','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL,NULL),
 (8,'Alejandro','Medina','31888999','3854100008','Mitre 258, Banda','Activo','1987-06-22','2020-05-18','alejandro@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL,NULL),
 (9,'Gustavo','Ríos','29999000','3854100009','Independencia 369, Capital','Activo','1984-10-03','2016-09-05','gustavo@muni.gov','Tarde','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL,NULL),
 (10,'Raúl','Cabrera','33000111','3854100010','Las Heras 741, Capital','Inactivo','1979-12-28','2015-04-12','raul@muni.gov','Mañana','2026-07-01 15:18:44','2026-07-01 15:18:44',NULL,NULL,'Baja por jubilación'),
 (11,'Exequiel','Juarez','39367819','37891738290','mzn a lote 6','Activo','2002-01-01','2026-07-01','ejemplo@gmail.com','Tarde/Noche','2026-07-01 18:22:52','2026-07-01 18:22:52','dni.jpg',NULL,NULL);

INSERT INTO `licencia_chofer` (`id_licencia`,`id_chofer`,`numero`,`categoria`,`fecha_emision`,`fecha_vencimiento`,`imagen`) VALUES
 (1,1,'LIC-00001','C','2023-01-10','2028-01-10','licencia.jpg'),
 (2,4,'LIC-00004','B2','2024-06-01','2027-06-01','licencia.jpg'),
 (3,8,'LIC-00008','C','2022-09-15','2027-09-15','licencia.jpg'),
 (4,2,'LIC-00002','B2','2021-07-06','2026-07-06','licencia.jpg'),
 (5,3,'LIC-00003','C','2021-07-04','2026-07-04','licencia.jpg'),
 (6,5,'LIC-00005','B1','2020-01-15','2026-01-15','licencia.jpg'),
 (7,6,'LIC-00006','C','2019-11-20','2025-11-20','licencia.jpg'),
 (8,7,'LIC-00007','B2','2020-03-10','2026-03-10','licencia.jpg'),
 (9,9,'LIC-00009','B1','2018-05-05','2025-05-05','licencia.jpg'),
 (10,10,'LIC-00010','C','2017-08-12','2024-08-12','licencia.jpg'),
 (11,11,'37283293232','B2','2026-07-01','2031-07-01','licencia.jpg');

INSERT INTO `asignacion_vehiculo` (`id_asignacion`,`id_vehiculo`,`id_chofer`,`fecha_salida`,`fecha_estimada_devolucion`,`fecha_devolucion`,`destino_area`,`observaciones`,`estado`) VALUES
 (1,1,1,'2026-09-28 03:00:00','2026-10-15 03:00:00',NULL,'Norte','Sale en buenas condiciones','Activo'),
 (2,5,5,'2026-07-01 03:00:00','2026-07-11 03:00:00','2026-07-02 02:02:09','Norte','Traslado de materiales','Finalizado');

INSERT INTO `repuestos` (`id_repuesto`,`nombre`,`stock`,`costo_unitario`) VALUES
 (1,'Filtro de Aceite (Universal)',14,6500.00),
 (2,'Aceite Sintético 10W40 (1 Litro)',30,8000.00),
 (3,'Pastillas de Freno (Juego Trasero)',8,28000.00),
 (4,'Filtro de Aire',14,15000.00),
 (5,'Pastillas de Freno',12,8000.00),
 (6,'Filtro de Aceite (Camioneta)',24,8500.00),
 (7,'Filtro de Aire (Camión)',12,14000.00),
 (8,'Filtro de Combustible (Diesel)',17,11500.00),
 (9,'Aceite Motor 15W40 (Tambor 20L)',8,85000.00),
 (10,'Aceite Sintético 5W30 (1L)',41,9500.00),
 (11,'Pastillas de Freno (Juego Delantero)',9,35000.00),
 (12,'Batería 12V 75Ah',5,120000.00),
 (13,'Amortiguador Delantero (Par)',4,185000.00),
 (14,'Bomba de Agua (Diesel)',6,75000.00),
 (15,'Kit de Embrague Completo',2,320000.00),
 (16,'Óptica Trasera Izquierda',15,45000.00),
 (17,'Espejo Retrovisor Derecho',10,38000.00),
 (18,'Cruceta de Cardán',22,18000.00),
 (19,'Inyector Common Rail',8,150000.00),
 (20,'Filtro de Habitáculo',40,6500.00),
 (21,'Correa Poly-V',30,22000.00),
 (22,'Bomba de Freno',5,85000.00);

INSERT INTO `mantenimiento` (`id_mantenimiento`,`id_vehiculo`,`id_usuario`,`tipo_servicio`,`fecha_inicio`,`fecha_fin`,`km_servicio`,`costo_total`,`descripcion`,`observaciones`,`proximo_km`,`proxima_fecha`,`estado`,`mano_obra`,`costo_repuestos`) VALUES
 (1,1,1,'Cambio de aceite','2026-07-01','2026-07-01',87000,86500.00,'Cambio de aceite y filtro','Aceite en mal estado',95000,NULL,'Realizado',40000.00,46500.00),
 (2,4,1,'Cambio de filtros','2026-07-02','2026-07-02',198000,56500.00,'Filtros de aire y combustible',NULL,205000,NULL,'Realizado',30000.00,26500.00),
 (3,3,1,'Frenos','2026-07-03','2026-07-03',45000,65000.00,'Cambio de pastillas delanteras',NULL,50000,NULL,'Realizado',30000.00,35000.00),
 (4,9,1,'Cambio de embrague','2026-09-25',NULL,55000,410000.00,'Reemplazo de kit de embrague completo',NULL,NULL,NULL,'En proceso',90000.00,320000.00);

INSERT INTO `detalle_mantenimiento` (`id_detalle`,`id_mantenimiento`,`id_repuesto`,`cantidad`,`costo_unitario`) VALUES
 (1,1,6,1,8500.00),
 (2,1,10,4,9500.00),
 (3,2,4,1,15000.00),
 (4,2,8,1,11500.00),
 (5,3,11,1,35000.00),
 (6,4,15,1,320000.00);

INSERT INTO `herramienta` (`id_herramienta`,`codigo_activo`,`nombre`,`sector`,`estado`,`stock`,`combustible_energia`,`observaciones`,`imagen_url`,`fecha_alta`) VALUES
 (1,'HTI-001','Amoladora Angular Bosch 4.5"','Taller Mecánico','Disponible',3,'Energía',NULL,NULL,'2023-05-10 03:00:00'),
 (2,'HTI-002','Amoladora','Construcción A','Disponible',2,'Energía','Se encuentran en buen estado',NULL,'2026-05-11 03:08:56'),
 (3,'HTI-003','Destornillador percutor','Taller Mecánico','En uso',1,'Energía',NULL,NULL,'2026-05-12 00:30:35'),
 (4,'HTI-004','Gato Hidráulico 20T','Depósito Central','Disponible',4,NULL,NULL,NULL,'2023-05-10 03:00:00'),
 (5,'HTI-005','Caja de Tubos Mando 1/2 (Juego)','Mantenimiento General','Disponible',5,NULL,NULL,NULL,'2023-05-10 03:00:00'),
 (6,'HTI-006','Soldadora Inverter 200A','Taller Mecánico','Disponible',2,'Energía',NULL,NULL,'2024-01-10 03:00:00'),
 (7,'HTI-007','Hidrolavadora Industrial 150 Bar','Mantenimiento General','En Reparación',1,'Energía',NULL,NULL,'2023-11-05 03:00:00'),
 (8,'HTI-008','Compresor de Aire 50L','Taller Mecánico','Disponible',3,'Energía',NULL,NULL,'2023-08-20 03:00:00'),
 (9,'HTI-009','Sierra Circular 7 1/4"','Construcción A','Disponible',2,'Energía',NULL,NULL,'2024-03-15 03:00:00'),
 (10,'HTI-010','Llave Dinamométrica 1/2"','Taller Mecánico','Disponible',4,NULL,NULL,NULL,'2023-06-30 03:00:00'),
 (11,'HTI-011','Cortadora de Césped Naftera','Espacios Verdes','Disponible',5,'Nafta',NULL,NULL,'2023-09-12 03:00:00'),
 (12,'HTI-012','Motosierra Stihl MS170','Espacios Verdes','En Reparación',3,'Nafta',NULL,NULL,'2024-02-28 03:00:00'),
 (13,'HTI-013','Taladro de Banco 16mm','Taller Mecánico','Disponible',1,'Energía',NULL,NULL,'2023-05-14 03:00:00'),
 (14,'HTI-014','Hormigonera 130L','Construcción A','Disponible',4,'Energía',NULL,NULL,'2024-04-10 03:00:00'),
 (15,'HTI-015','Escalera de Aluminio 12 Escalones','Mantenimiento General','Disponible',6,NULL,NULL,NULL,'2023-12-01 03:00:00');

INSERT INTO `prestamo` (`id_prestamo`,`id_herramienta`,`nombre_operario`,`fecha_salida`,`fecha_devolucion_estimada`,`fecha_devolucion_real`,`sector_destino`,`observaciones`,`estado_prestamo`) VALUES
 (1,2,'Gomez Juan','2026-05-11 03:00:00','2026-05-20 03:00:00','2026-05-11 03:10:00','Espacios Verdes',NULL,'Finalizado'),
 (2,2,'Juan Pérez','2026-05-12 03:00:00','2026-06-20 03:00:00','2026-05-13 03:10:44','Taller Mecánico',NULL,'Finalizado'),
 (3,3,'Gomez Juan','2026-05-11 03:00:00','2026-06-30 03:00:00',NULL,'Construcción A',NULL,'Activo');

SET FOREIGN_KEY_CHECKS = 1;
