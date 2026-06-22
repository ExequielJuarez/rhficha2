-- ============================================================
--  vehiculos_db  —  Schema unificado
-- ============================================================

CREATE DATABASE vehiculos_db;

USE vehiculos_db;

-- ============================================================
--  ROLES Y USUARIOS
-- ============================================================

CREATE TABLE rol (
  id_rol      INT          NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50)  NOT NULL,
  descripcion VARCHAR(255),
  PRIMARY KEY (id_rol)
);

CREATE TABLE usuario (
  id_usuario     INT          NOT NULL AUTO_INCREMENT,
  nombre_usuario VARCHAR(50)  NOT NULL UNIQUE,
  contrasena     VARCHAR(255) NOT NULL,
  nombre         VARCHAR(50)  NOT NULL,
  apellido       VARCHAR(50)  NOT NULL,
  activo         BOOLEAN      NOT NULL DEFAULT TRUE,
  id_rol         INT          NOT NULL,
  PRIMARY KEY (id_usuario),
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol (id_rol)
);

-- ============================================================
--  VEHÍCULOS
-- ============================================================

CREATE TABLE tipo_vehiculo (
  id_tipo     INT          NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_tipo)
);

CREATE TABLE vehiculo (
  id_vehiculo   INT          NOT NULL AUTO_INCREMENT,
  patente       VARCHAR(20)  NOT NULL UNIQUE,
  legajo        VARCHAR(30)  UNIQUE,
  marca         VARCHAR(50)  NOT NULL,
  modelo        VARCHAR(50)  NOT NULL,
  anio          INT          NOT NULL,
  id_tipo       INT          NOT NULL,
  num_chasis    VARCHAR(50),
  num_motor     VARCHAR(50),
  combustible   VARCHAR(30),
  transmision   VARCHAR(30),
  km_actual     INT          NOT NULL DEFAULT 0,
  estado_actual VARCHAR(50)  NOT NULL DEFAULT 'Disponible',
  distrito      VARCHAR(50),
  area          VARCHAR(100),
  observaciones TEXT,
  imagen_url    VARCHAR(255),
  fecha_alta    DATE         NOT NULL,
  fecha_baja    DATE,
  PRIMARY KEY (id_vehiculo),
  CONSTRAINT fk_vehiculo_tipo FOREIGN KEY (id_tipo) REFERENCES tipo_vehiculo (id_tipo)
);

-- ============================================================
--  CHOFERES / OPERARIOS
-- ============================================================

CREATE TABLE chofer (
  id_chofer   INT          NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50)  NOT NULL,
  apellido    VARCHAR(50)  NOT NULL,
  dni         VARCHAR(20)  NOT NULL UNIQUE,
  telefono    VARCHAR(20),
  direccion   VARCHAR(150),
  estado      VARCHAR(20)  NOT NULL DEFAULT 'Activo',
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_chofer)
);

CREATE TABLE licencia_chofer (
  id_licencia       INT         NOT NULL AUTO_INCREMENT,
  id_chofer         INT         NOT NULL,
  numero            VARCHAR(50) NOT NULL,
  categoria         VARCHAR(20) NOT NULL,
  fecha_emision     DATE        NOT NULL,
  fecha_vencimiento DATE        NOT NULL,
  PRIMARY KEY (id_licencia),
  CONSTRAINT fk_licencia_chofer FOREIGN KEY (id_chofer) REFERENCES chofer (id_chofer)
);

CREATE TABLE operarios (
  id_operario INT          NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100) NOT NULL,
  estado      VARCHAR(50)  DEFAULT 'Activo',
  PRIMARY KEY (id_operario)
);

-- ============================================================
--  ASIGNACIÓN DE VEHÍCULOS A CHOFERES
-- ============================================================

CREATE TABLE asignacion_vehiculo (
  id_asignacion             INT          NOT NULL AUTO_INCREMENT,
  id_vehiculo               INT          NOT NULL,
  id_chofer                 INT          NOT NULL,
  fecha_salida              DATETIME     NOT NULL,
  fecha_estimada_devolucion DATETIME,
  fecha_devolucion          DATETIME,
  destino_area              VARCHAR(100),
  observaciones             TEXT,
  estado                    VARCHAR(20)  NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (id_asignacion),
  CONSTRAINT fk_asig_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo (id_vehiculo),
  CONSTRAINT fk_asig_chofer   FOREIGN KEY (id_chofer)   REFERENCES chofer   (id_chofer)
);

-- ============================================================
--  DOCUMENTACIÓN DEL VEHÍCULO
-- ============================================================

CREATE TABLE documentacion (
  id_documentacion  INT          NOT NULL AUTO_INCREMENT,
  id_vehiculo       INT          NOT NULL,
  tipo_documento    VARCHAR(100) NOT NULL,
  fecha_emision     DATE,
  fecha_vencimiento DATE,
  archivo           VARCHAR(255),
  estado            VARCHAR(20)  NOT NULL DEFAULT 'Vigente',
  PRIMARY KEY (id_documentacion),
  CONSTRAINT fk_doc_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo (id_vehiculo)
);

-- ============================================================
--  MANTENIMIENTOS
-- ============================================================

CREATE TABLE mantenimiento (
  id_mantenimiento INT           NOT NULL AUTO_INCREMENT,
  id_vehiculo      INT           NOT NULL,
  id_usuario       INT           NOT NULL,
  tipo_servicio    VARCHAR(100)  NOT NULL,
  fecha_inicio     DATE          NOT NULL,
  fecha_fin        DATE,
  km_servicio      INT           NOT NULL,
  costo_total      DECIMAL(12,2),
  descripcion      TEXT,
  proximo_km       INT,
  proxima_fecha    DATE,
  estado           VARCHAR(20)   NOT NULL DEFAULT 'Realizado',
  PRIMARY KEY (id_mantenimiento),
  CONSTRAINT fk_mant_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo (id_vehiculo),
  CONSTRAINT fk_mant_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuario  (id_usuario)
);

-- ============================================================
--  REPUESTOS / STOCK
-- ============================================================

CREATE TABLE repuesto (
  id_repuesto   INT          NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   TEXT,
  unidad_medida VARCHAR(30),
  stock_actual  INT          NOT NULL DEFAULT 0,
  stock_minimo  INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id_repuesto)
);

CREATE TABLE movimiento_stock (
  id_movimiento   INT         NOT NULL AUTO_INCREMENT,
  id_repuesto     INT         NOT NULL,
  id_usuario      INT         NOT NULL,
  tipo_movimiento VARCHAR(20) NOT NULL,
  cantidad        INT         NOT NULL,
  fecha           DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  descripcion     TEXT,
  PRIMARY KEY (id_movimiento),
  CONSTRAINT fk_mov_repuesto FOREIGN KEY (id_repuesto) REFERENCES repuesto (id_repuesto),
  CONSTRAINT fk_mov_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuario  (id_usuario)
);

CREATE TABLE detalle_mantenimiento (
  id_detalle       INT           NOT NULL AUTO_INCREMENT,
  id_mantenimiento INT           NOT NULL,
  id_repuesto      INT           NOT NULL,
  cantidad         INT           NOT NULL,
  costo_unitario   DECIMAL(12,2),
  PRIMARY KEY (id_detalle),
  CONSTRAINT fk_det_mant     FOREIGN KEY (id_mantenimiento) REFERENCES mantenimiento (id_mantenimiento),
  CONSTRAINT fk_det_repuesto FOREIGN KEY (id_repuesto)      REFERENCES repuesto      (id_repuesto)
);

-- ============================================================
--  HERRAMIENTAS
-- ============================================================

CREATE TABLE sectores (
  id_sector INT          NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_sector)
);

CREATE TABLE herramienta (
  id_herramienta      INT          NOT NULL AUTO_INCREMENT,
  codigo_activo       VARCHAR(50)  NOT NULL UNIQUE,
  nombre              VARCHAR(100) NOT NULL,
  sector              VARCHAR(100),
  estado              VARCHAR(50)  NOT NULL DEFAULT 'Disponible',
  stock               INT          NOT NULL DEFAULT 1,
  combustible_energia VARCHAR(50),
  observaciones       TEXT,
  imagen_url          VARCHAR(255),
  fecha_alta          DATETIME     NOT NULL,
  PRIMARY KEY (id_herramienta)
);

CREATE TABLE prestamo (
  id_prestamo               INT          NOT NULL AUTO_INCREMENT,
  id_herramienta            INT          NOT NULL,
  nombre_operario           VARCHAR(100) NOT NULL,
  fecha_salida              DATETIME     NOT NULL,
  fecha_devolucion_estimada DATETIME,
  fecha_devolucion_real     DATETIME,
  sector_destino            VARCHAR(100),
  estado_prestamo           VARCHAR(50)  NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (id_prestamo),
  CONSTRAINT fk_prestamo_herramienta
    FOREIGN KEY (id_herramienta) REFERENCES herramienta (id_herramienta)
    ON UPDATE CASCADE
);

-- ============================================================
--  AUDITORÍA
-- ============================================================

CREATE TABLE auditoria (
  id_auditoria         INT          NOT NULL AUTO_INCREMENT,
  id_usuario           INT          NOT NULL,
  tabla_afectada       VARCHAR(100) NOT NULL,
  id_registro_afectado INT,
  accion               VARCHAR(20)  NOT NULL,
  fecha                DATE         NOT NULL,
  hora                 TIME         NOT NULL,
  valor_anterior       TEXT,
  valor_nuevo          TEXT,
  descripcion          TEXT,
  PRIMARY KEY (id_auditoria),
  CONSTRAINT fk_audit_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

-- ============================================================
--  ÍNDICES
-- ============================================================

CREATE INDEX idx_vehiculo_patente ON vehiculo            (patente);
CREATE INDEX idx_vehiculo_estado  ON vehiculo            (estado_actual);
CREATE INDEX idx_asig_vehiculo    ON asignacion_vehiculo (id_vehiculo);
CREATE INDEX idx_asig_chofer      ON asignacion_vehiculo (id_chofer);
CREATE INDEX idx_mant_vehiculo    ON mantenimiento       (id_vehiculo);
CREATE INDEX idx_mant_fecha       ON mantenimiento       (fecha_inicio);
CREATE INDEX idx_doc_vencimiento  ON documentacion       (id_vehiculo, fecha_vencimiento);
CREATE INDEX idx_stock_repuesto   ON repuesto            (stock_actual);
CREATE INDEX idx_audit_usuario    ON auditoria           (id_usuario);
CREATE INDEX idx_audit_fecha      ON auditoria           (fecha);
CREATE INDEX idx_prestamo_estado  ON prestamo            (estado_prestamo);

-- ============================================================
--  DATOS INICIALES
-- ============================================================

INSERT INTO rol (nombre, descripcion) VALUES
  ('Administrador',  'Acceso total al sistema'),
  ('Jefe de Taller', 'Acceso a mantenimientos, repuestos y herramientas'),
  ('Principal',      'Acceso de supervisión general y reportes');

INSERT INTO tipo_vehiculo (descripcion) VALUES
  ('Camioneta'),
  ('Camión'),
  ('Maquinaria Pesada'),
  ('Utilitario'),
  ('Auto'),
  ('Motocicleta');

INSERT INTO usuario (nombre_usuario, contrasena, nombre, apellido, id_rol) VALUES
  ('admin', '$2b$10$PLACEHOLDER_HASH', 'Administrador', 'Sistema', 1);

INSERT INTO herramienta VALUES
  (2,'HTI-002','Amoladora','Mantenimiento Elect.','Disponible',2,'Energia','Se encuentran en buen estado','Sin título.jpg','2026-05-11 03:08:56'),
  (3,'HTI-003','Destornillador percutor','Taller Mecánico','En uso',1,'Energia','Prueba 3','','2026-05-12 00:30:35');

INSERT INTO operarios (id_operario, nombre, estado) VALUES
  (1,'Hernán Quiroga','Activo'),
  (2,'Marcos Díaz','Activo'),
  (4,'Gomez Juan','Activo');

INSERT INTO prestamo VALUES
  (3,2,'Gomez Juan','2026-05-11 00:00:00','2026-05-20 00:00:00','2026-05-11 03:10:00','Espacios Verdes','Finalizado'),
  (4,2,'Juan Pérez','2026-05-12 00:00:00','2026-06-20 00:00:00','2026-05-11 03:10:44','Taller Central','Finalizado'),
  (5,3,'Gomez Juan','2026-05-11 00:00:00','2026-06-30 00:00:00',NULL,'Construcción A','Activo');

INSERT INTO sectores (id_sector, nombre) VALUES
  (2,'Construcción A'),
  (3,'Taller Mecánico'),
  (4,'Espacios Verdes');

INSERT INTO vehiculo
  (id_vehiculo, patente, legajo, marca, modelo, anio, id_tipo, num_chasis, num_motor,
   transmision, km_actual, estado_actual, distrito, area, observaciones, imagen_url, fecha_alta)
VALUES
  (1,'PPP101',NULL,'TOYOTA','HAYLUX',2000,1,'212313545615646531321546','45642132164654654134654',
   'Manual',100000,'Disponible','Centro',NULL,'Carga de Prueba',
   'viscosidad-del-agua-1024x683.jpg.jpg','2026-05-10');
   
   

ALTER TABLE usuario
ADD COLUMN permisos JSON NULL;

ALTER TABLE rol
ADD COLUMN permisos JSON NULL;

UPDATE usuario
SET contrasena = '$2b$12$CLH/uvs4ohyNSFuTNOBuXO9GLMDMklV2945./nMZeQ8qmNAgDz75i'
WHERE nombre_usuario = 'admin5';

ALTER TABLE chofer
  ADD COLUMN fechaNacimiento DATE NULL,
  ADD COLUMN fechaIngreso    DATE NULL,
  ADD COLUMN email           VARCHAR(100) NULL,
  ADD COLUMN turno           VARCHAR(50) NULL;
  
