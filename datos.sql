.-- ══════════════════════════════════════════
-- LIMPIEZA
-- ══════════════════════════════════════════
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE siniestro;
TRUNCATE TABLE asignacion_vehiculo;
TRUNCATE TABLE historial_km;
TRUNCATE TABLE detalle_mantenimiento;
TRUNCATE TABLE mantenimiento;
TRUNCATE TABLE documentacion;
TRUNCATE TABLE licencia_chofer;
TRUNCATE TABLE alerta;
TRUNCATE TABLE auditoria;
TRUNCATE TABLE chofer;
TRUNCATE TABLE vehiculo;

SET FOREIGN_KEY_CHECKS = 1;

-- ══════════════════════════════════════════
-- 10 VEHÍCULOS con seguros y RTO variados
-- Fecha base de hoy: 2026-07-01
-- ══════════════════════════════════════════
INSERT INTO `vehiculo` 
  (patente, marca, modelo, anio, id_tipo, num_chasis, num_motor, km_actual, estado_actual, distrito, fecha_alta,
   seguro_compania, seguro_vencimiento, rto_vencimiento,
   cedula_numero, cedula_titular, foto_cedula)
VALUES
-- ── SEGUROS VIGENTES ──────────────────────────────────────────────────────────
('AA001BB', 'Toyota',        'Hilux',         2019, 1, 'CHS-001', 'MOT-001',  87000, 'Disponible', 'Centro', '2023-01-10',
 'Federación Patronal', '2027-03-15', '2026-09-10',
 'CED-001', 'Municipalidad Capital', 'cedula.jpg'),

('AB002CC', 'Ford',          'Ranger',        2020, 1, 'CHS-002', 'MOT-002', 124000, 'Disponible', 'Norte',  '2023-03-15',
 'San Cristóbal',       '2026-07-06', NULL,
 'CED-002', 'Municipalidad Capital', 'cedula.jpg'),

('AC003DD', 'Volkswagen',    'Amarok',        2021, 1, 'CHS-003', 'MOT-003',  45000, 'Disponible', 'Sur',    '2023-06-01',
 'La Caja',             '2026-07-04', '2026-07-03',
 'CED-003', 'Municipalidad Capital', 'cedula.jpg'),

('AD004EE', 'Chevrolet',     'S-10',          2018, 1, 'CHS-004', 'MOT-004', 198000, 'Disponible', 'Centro', '2022-11-20',
 'Federación Patronal', '2027-01-20', '2027-01-20',
 'CED-004', 'Municipalidad Capital', 'cedula.jpg'),

('AE005FF', 'Mercedes-Benz', 'Tector',        2020, 2, 'CHS-005', 'MOT-005', 310000, 'Disponible', 'Norte',  '2022-08-05',
 'San Cristóbal',       '2026-07-05', NULL,
 'CED-005', 'Municipalidad Capital', 'cedula.jpg'),

-- ── SEGUROS VENCIDOS ──────────────────────────────────────────────────────────
('AF006GG', 'Scania',        'R410',          2019, 2, 'CHS-006', 'MOT-006', 415000, 'Disponible', 'Sur',    '2022-05-18',
 'Rivadavia Seguros',   '2026-04-10', '2026-11-15',
 'CED-006', 'Municipalidad Capital', 'cedula.jpg'),

('AG007HH', 'Iveco',         'Tector 170E28', 2022, 2, 'CHS-007', 'MOT-007',  62000, 'Disponible', 'Centro', '2023-09-01',
 'Zurich',              '2026-05-01', NULL,
 'CED-007', 'Municipalidad Capital', 'cedula.jpg'),

('AH008II', 'Nissan',        'Frontier',      2021, 1, 'CHS-008', 'MOT-008',  73000, 'Disponible', 'Norte',  '2023-07-12',
 'Mapfre',              '2026-03-20', '2026-08-05',
 'CED-008', 'Municipalidad Capital', 'cedula.jpg'),

('AI009JJ', 'Renault',       'Kangoo',        2020, 4, 'CHS-009', 'MOT-009',  55000, 'Disponible', 'Sur',    '2023-04-22',
 'Sancor Seguros',      '2026-02-14', NULL,
 'CED-009', 'Municipalidad Capital', 'cedula.jpg'),

('AJ010KK', 'Ford',          'Transit',       2023, 4, 'CHS-010', 'MOT-010',  18000, 'Disponible', 'Centro', '2024-01-08',
 'La Segunda',          '2025-12-01', '2026-10-20',
 'CED-010', 'Municipalidad Capital', 'cedula.jpg');

-- ══════════════════════════════════════════
-- 10 CHOFERES
-- ══════════════════════════════════════════
INSERT INTO `chofer`
  (nombre, apellido, dni, telefono, direccion, estado, fechaNacimiento, fechaIngreso, email, turno, createdAt, updatedAt)
VALUES
('Carlos',    'Rodríguez',  '28111222', '3854100001', 'Av. Libertad 123, Capital',  'Activo',      '1985-03-12', '2020-01-05', 'carlos@muni.gov',    'Mañana', NOW(), NOW()),
('Sergio',    'Villalba',   '30222333', '3854100002', 'San Martín 456, Capital',    'Activo',      '1988-07-24', '2019-06-10', 'sergio@muni.gov',    'Tarde',  NOW(), NOW()),
('Marcelo',   'Paz',        '32333444', '3854100003', 'Belgrano 789, Banda',        'Activo',      '1990-11-05', '2021-03-01', 'marcelo@muni.gov',   'Mañana', NOW(), NOW()),
('Diego',     'Herrera',    '25444555', '3854100004', 'Rivadavia 321, Capital',     'Activo',      '1982-01-30', '2018-08-15', 'diego@muni.gov',     'Mañana', NOW(), NOW()),
('Roberto',   'Leiva',      '35555666', '3854100005', 'Sarmiento 654, Banda',       'Activo',      '1992-05-18', '2022-02-20', 'roberto@muni.gov',   'Tarde',  NOW(), NOW()),
('Fernando',  'Gutiérrez',  '27666777', '3854100006', 'Tucumán 987, Capital',       'Activo',      '1983-09-07', '2017-11-01', 'fernando@muni.gov',  'Mañana', NOW(), NOW()),
('Pablo',     'Soria',      '38777888', '3854100007', 'Córdoba 147, Capital',       'De Licencia', '1995-02-14', '2023-01-10', 'pablo@muni.gov',     'Tarde',  NOW(), NOW()),
('Alejandro', 'Medina',     '31888999', '3854100008', 'Mitre 258, Banda',           'Activo',      '1987-06-22', '2020-05-18', 'alejandro@muni.gov', 'Mañana', NOW(), NOW()),
('Gustavo',   'Ríos',       '29999000', '3854100009', 'Independencia 369, Capital', 'Activo',      '1984-10-03', '2016-09-05', 'gustavo@muni.gov',   'Tarde',  NOW(), NOW()),
('Raúl',      'Cabrera',    '33000111', '3854100010', 'Las Heras 741, Capital',     'Inactivo',    '1979-12-28', '2015-04-12', 'raul@muni.gov',      'Mañana', NOW(), NOW());

-- ══════════════════════════════════════════════════════════════════
-- LICENCIAS DE CHOFER
-- Fecha base hoy: 2026-07-01
-- 3 vigentes, 2 a punto de vencer, 5 vencidas
-- ══════════════════════════════════════════════════════════════════
INSERT INTO `licencia_chofer` (id_chofer, numero, categoria, fecha_emision, fecha_vencimiento, imagen) VALUES

-- VIGENTES OK
(1, 'LIC-00001', 'C',  '2023-01-10', '2028-01-10', 'licencia.jpg'),
(4, 'LIC-00004', 'B2', '2024-06-01', '2027-06-01', 'licencia.jpg'),
(8, 'LIC-00008', 'C',  '2022-09-15', '2027-09-15', 'licencia.jpg'),

-- A PUNTO DE VENCER
(2, 'LIC-00002', 'B2', '2021-07-06', '2026-07-06', 'licencia.jpg'),   -- vence en 5 días
(3, 'LIC-00003', 'C',  '2021-07-04', '2026-07-04', 'licencia.jpg'),   -- vence en 3 días

-- VENCIDAS
(5, 'LIC-00005', 'B',  '2020-01-15', '2026-01-15', 'licencia.jpg'),   -- vencida hace 167 días
(6, 'LIC-00006', 'C',  '2019-11-20', '2025-11-20', 'licencia.jpg'),   -- vencida hace 223 días
(7, 'LIC-00007', 'B2', '2020-03-10', '2026-03-10', 'licencia.jpg'),   -- vencida hace 113 días
(9, 'LIC-00009', 'B',  '2018-05-05', '2025-05-05', 'licencia.jpg'),   -- vencida hace 422 días
(10,'LIC-00010', 'C',  '2017-08-12', '2024-08-12', 'licencia.jpg');   -- vencida hace 688 días

-- ══════════════════════════════════════════
-- DOCUMENTACIÓN
-- ══════════════════════════════════════════
INSERT INTO `documentacion` (id_vehiculo, tipo_documento, fecha_emision, fecha_vencimiento, archivo, estado) VALUES
(1,  'DNI Titular',      '2020-01-01', NULL,         'dni.jpg',    'Vigente'),
(1,  'Póliza de Seguro', '2026-03-15', '2027-03-15', 'seguro.png', 'Vigente'),
(4,  'DNI Titular',      '2019-05-10', NULL,         'dni.jpg',    'Vigente'),
(4,  'Póliza de Seguro', '2026-01-20', '2027-01-20', 'seguro.png', 'Vigente'),
(6,  'DNI Titular',      '2018-04-01', NULL,         'dni.jpg',    'Vigente'),
(6,  'Póliza de Seguro', '2025-04-10', '2026-04-10', 'seguro.png', 'Vencida'),
(8,  'DNI Titular',      '2021-07-12', NULL,         'dni.jpg',    'Vigente'),
(8,  'Póliza de Seguro', '2025-03-20', '2026-03-20', 'seguro.png', 'Vencida'),
(10, 'DNI Titular',      '2023-01-08', NULL,         'dni.jpg',    'Vigente'),
(10, 'Póliza de Seguro', '2024-12-01', '2025-12-01', 'seguro.png', 'Vencida');

-- ══════════════════════════════════════════
-- HISTORIAL KM (5 vehículos, varias fechas)
-- ══════════════════════════════════════════

-- Vehículo 1 - Toyota Hilux (AA001BB)
INSERT INTO historial_km (id_vehiculo, km_anterior, km_nuevo, fecha, observaciones) VALUES
(1, 70000,  78000,  '2024-08-15', 'Actualización mensual rutinaria'),
(1, 78000,  83000,  '2024-10-20', 'Regreso de comisión distrito sur'),
(1, 83000,  87000,  '2024-12-05', 'Actualización fin de año');

-- Vehículo 2 - Ford Ranger (AB002CC)
INSERT INTO historial_km (id_vehiculo, km_anterior, km_nuevo, fecha, observaciones) VALUES
(2,  98000, 107000, '2024-07-10', 'Viaje a Guayamba'),
(2, 107000, 115000, '2024-09-18', 'Obras distrito norte'),
(2, 115000, 121000, '2024-11-30', 'Relevamiento campo'),
(2, 121000, 124000, '2025-01-14', 'Actualización trimestral');

-- Vehículo 3 - Volkswagen Amarok (AC003DD)
INSERT INTO historial_km (id_vehiculo, km_anterior, km_nuevo, fecha, observaciones) VALUES
(3, 30000,  38000,  '2024-09-05', 'Control rutinario'),
(3, 38000,  45000,  '2025-02-20', 'Comisión inter-distrital');

-- Vehículo 5 - Mercedes-Benz Tector (AE005FF)
INSERT INTO historial_km (id_vehiculo, km_anterior, km_nuevo, fecha, observaciones) VALUES
(5, 270000, 288000, '2024-06-01', 'Transporte de materiales'),
(5, 288000, 301000, '2024-08-22', 'Obras viales norte'),
(5, 301000, 310000, '2024-11-10', 'Fin de temporada obras');

-- Vehículo 8 - Nissan Frontier (AH008II)
INSERT INTO historial_km (id_vehiculo, km_anterior, km_nuevo, fecha, observaciones) VALUES
(8, 58000,  65000,  '2024-10-03', 'Actualización después de comisión'),
(8, 65000,  73000,  '2025-03-18', 'Relevamiento zona sur');