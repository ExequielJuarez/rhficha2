-- ============================================================
--  5 CHOFERES
-- ============================================================

INSERT INTO chofer (nombre, apellido, dni, telefono, direccion, estado) VALUES
('Carlos',    'Rodríguez',  '28456123', '3854-123456', 'Av. Belgrano 1234, La Banda',       'Activo'),
('Miguel',    'Fernández',  '31789456', '3854-234567', 'San Martín 567, La Banda',          'Activo'),
('Roberto',   'Gómez',      '25123789', '3854-345678', 'Rivadavia 890, Santiago del Estero','Activo'),
('Diego',     'Herrera',    '33456012', '3854-456789', 'Independencia 321, La Banda',       'Activo'),
('Sebastián', 'Villalba',   '29678345', '3854-567890', 'Tucumán 654, Santiago del Estero',  'Activo');

-- ============================================================
--  15 VEHÍCULOS
-- ============================================================

INSERT INTO vehiculo
  (patente, legajo, marca, modelo, anio, id_tipo, num_chasis, num_motor, combustible, transmision, km_actual, estado_actual, distrito, area, observaciones, fecha_alta)
VALUES
('AB123CD', 'LEG-001', 'Ford',       'Ranger',          2018, 1, 'CHS-F-001', 'MOT-F-001', 'Diesel',   'Manual',     85000,  'Disponible',        'Centro', 'Obras Públicas',        'Sin observaciones',        '2026-01-10'),
('BC234DE', 'LEG-002', 'Toyota',     'Hilux',            2020, 1, 'CHS-T-002', 'MOT-T-002', 'Diesel',   'Manual',     62000,  'Disponible',        'Norte',  'Mantenimiento Urbano',  'Revisión reciente',        '2026-01-15'),
('CD345EF', 'LEG-003', 'Volkswagen', 'Amarok',           2019, 1, 'CHS-V-003', 'MOT-V-003', 'Diesel',   'Automatica', 74000,  'En uso',            'Sur',    'Espacios Verdes',       'Asignada a cuadrilla sur', '2026-01-20'),
('DE456FG', 'LEG-004', 'Mercedes',   'Sprinter',         2017, 4, 'CHS-M-004', 'MOT-M-004', 'Diesel',   'Manual',     130000, 'Disponible',        'Centro', 'Obras Públicas',        'Sin observaciones',        '2026-01-25'),
('EF567GH', 'LEG-005', 'Renault',    'Master',           2016, 4, 'CHS-R-005', 'MOT-R-005', 'Diesel',   'Manual',     148000, 'En mantenimiento',  'Norte',  'Taller Central',        'Cambio de frenos pendiente','2026-02-01'),
('FG678HI', 'LEG-006', 'Iveco',      'Daily',            2018, 4, 'CHS-I-006', 'MOT-I-006', 'Diesel',   'Manual',     97000,  'Disponible',        'Sur',    'Mantenimiento Urbano',  'Sin observaciones',        '2026-02-05'),
('GH789IJ', 'LEG-007', 'Mercedes',   'Actros',           2015, 2, 'CHS-M-007', 'MOT-M-007', 'Diesel',   'Manual',     210000, 'Disponible',        'Centro', 'Obras Públicas',        'Camión volcador',          '2026-02-10'),
('HI890JK', 'LEG-008', 'Scania',     'R450',             2017, 2, 'CHS-S-008', 'MOT-S-008', 'Diesel',   'Automatica', 185000, 'En uso',            'Norte',  'Obras Públicas',        'En ruta actualmente',      '2026-02-15'),
('IJ901KL', 'LEG-009', 'Volvo',      'FH',               2016, 2, 'CHS-V-009', 'MOT-V-009', 'Diesel',   'Automatica', 225000, 'Disponible',        'Sur',    'Obras Públicas',        'Sin observaciones',        '2026-02-20'),
('JK012LM', 'LEG-010', 'Caterpillar','950M',             2014, 3, 'CHS-C-010', 'MOT-C-010', 'Diesel',   'Automatica', 9500,   'Disponible',        'Centro', 'Construcción',          'Pala cargadora frontal',   '2026-03-01'),
('KL123MN', 'LEG-011', 'Komatsu',    'PC210',            2015, 3, 'CHS-K-011', 'MOT-K-011', 'Diesel',   'Automatica', 7800,   'En uso',            'Norte',  'Construcción',          'Excavadora en obra norte',  '2026-03-05'),
('LM234NO', 'LEG-012', 'John Deere', '310L',             2016, 3, 'CHS-J-012', 'MOT-J-012', 'Diesel',   'Automatica', 5200,   'En mantenimiento',  'Sur',    'Espacios Verdes',       'Retroexcavadora',          '2026-03-10'),
('MN345OP', 'LEG-013', 'Fiat',       'Doblò Cargo',      2021, 4, 'CHS-F-013', 'MOT-F-013', 'Nafta',    'Manual',     38000,  'Disponible',        'Centro', 'Administración',        'Vehículo de reparto',      '2026-03-15'),
('NO456PQ', 'LEG-014', 'Peugeot',    'Partner',          2020, 4, 'CHS-P-014', 'MOT-P-014', 'Nafta',    'Manual',     45000,  'Disponible',        'Norte',  'Administración',        'Sin observaciones',        '2026-03-20'),
('OP567QR', 'LEG-015', 'Honda',      'CB 190R',          2022, 6, 'CHS-H-015', 'MOT-H-015', 'Nafta',    'Manual',     12000,  'Disponible',        'Sur',    'Inspección',            'Moto para inspecciones',   '2026-03-25');

-- ============================================================
--  MANTENIMIENTOS
--  Vehículo id 1  →  5 mantenimientos
--  Vehículo id 2  →  7 mantenimientos
--  Vehículo id 3  →  3 mantenimientos
-- ============================================================

-- ----------------------------------------
--  VEHÍCULO 1 — Ford Ranger (AB123CD) — 5
-- ----------------------------------------
INSERT INTO mantenimiento (id_vehiculo, id_usuario, tipo_servicio, fecha_inicio, fecha_fin, km_servicio, costo_total, descripcion, proximo_km, proxima_fecha, estado) VALUES
(1, 1, 'Cambio de aceite y filtros',        '2025-06-10', '2025-06-10', 60000, 18500.00,  'Aceite 15W40, filtro de aceite y aire',              65000, '2025-11-10', 'Realizado'),
(1, 1, 'Revisión de frenos',                '2025-08-05', '2025-08-06', 65000, 32000.00,  'Pastillas delanteras y traseras reemplazadas',       70000, '2026-02-05', 'Realizado'),
(1, 1, 'Cambio de correa de distribución',  '2025-10-12', '2025-10-13', 70000, 54000.00,  'Correa y tensor reemplazados',                       90000, '2026-10-12', 'Realizado'),
(1, 1, 'Service completo',                  '2026-01-20', '2026-01-21', 78000, 76500.00,  'Aceite, filtros, bujías, líquido de frenos',         88000, '2026-07-20', 'Realizado'),
(1, 1, 'Cambio de neumáticos',              '2026-04-03', '2026-04-03', 85000, 98000.00,  'Cuatro neumáticos 265/70 R16 nuevos',                NULL,  '2027-04-03', 'Realizado');

-- ----------------------------------------
--  VEHÍCULO 2 — Toyota Hilux (BC234DE) — 7
-- ----------------------------------------
INSERT INTO mantenimiento (id_vehiculo, id_usuario, tipo_servicio, fecha_inicio, fecha_fin, km_servicio, costo_total, descripcion, proximo_km, proxima_fecha, estado) VALUES
(2, 1, 'Cambio de aceite',                  '2025-02-14', '2025-02-14', 40000, 15000.00,  'Aceite 5W30 sintético y filtro',                     45000, '2025-08-14', 'Realizado'),
(2, 1, 'Revisión suspensión delantera',     '2025-04-20', '2025-04-21', 44000, 41000.00,  'Amortiguadores delanteros reemplazados',             54000, '2026-04-20', 'Realizado'),
(2, 1, 'Cambio de filtro de combustible',   '2025-06-01', '2025-06-01', 47000, 8500.00,   'Filtro de gasoil reemplazado',                       57000, '2026-06-01', 'Realizado'),
(2, 1, 'Service aceite y filtros',          '2025-08-18', '2025-08-18', 50000, 17500.00,  'Aceite, filtro aceite y filtro aire',                55000, '2026-02-18', 'Realizado'),
(2, 1, 'Revisión sistema eléctrico',        '2025-10-05', '2025-10-06', 53000, 22000.00,  'Batería reemplazada, revisión alternador',           NULL,  NULL,          'Realizado'),
(2, 1, 'Cambio de embrague',                '2025-12-10', '2025-12-12', 57000, 87000.00,  'Kit de embrague completo reemplazado',               NULL,  '2027-12-10', 'Realizado'),
(2, 1, 'Service completo + neumáticos',     '2026-03-22', '2026-03-23', 62000, 115000.00, 'Service general y dos neumáticos traseros nuevos',   72000, '2026-09-22', 'Realizado');

-- ----------------------------------------
--  VEHÍCULO 3 — VW Amarok (CD345EF) — 3
-- ----------------------------------------
INSERT INTO mantenimiento (id_vehiculo, id_usuario, tipo_servicio, fecha_inicio, fecha_fin, km_servicio, costo_total, descripcion, proximo_km, proxima_fecha, estado) VALUES
(3, 1, 'Cambio de aceite y filtros',        '2025-05-08', '2025-05-08', 60000, 19000.00,  'Aceite 5W40 sintético, filtro aceite y habitáculo', 70000, '2025-11-08', 'Realizado'),
(3, 1, 'Revisión frenos y suspensión',      '2025-09-15', '2025-09-16', 66000, 53500.00,  'Discos y pastillas delanteras, revisión rótulas',    76000, '2026-09-15', 'Realizado'),
(3, 1, 'Service completo',                  '2026-02-28', '2026-03-01', 74000, 82000.00,  'Aceite, filtros, líquidos, revisión general',        84000, '2026-08-28', 'Realizado');


INSERT INTO usuario 
(nombre_usuario, contrasena, nombre, apellido, activo, id_rol)
VALUES
(
  'admin2',
  '$2a$10$5XJ1xv6Y1f4Qm6Vn0mX9Iu3P4M4f3x0Q4i4K6kQmN4v2zQ8mJmY7K',
  'Juan',
  'Administrador',
  TRUE,
  1
),
(
  'usuario',
  '$2a$10$M7wJm9K1lN4dP8qT2xV0Bu3nF5cQ7zW8rT6yU1iO2pL3kJ4hG5fD6',
  'Pedro',
  'Gomez',
  TRUE,
  3
);


INSERT INTO usuario
(nombre_usuario, contrasena, nombre, apellido, activo, id_rol)
VALUES
(
  'admin5',
  'admin123',
  'Juan',
  'Administrador',
  TRUE,
  1
);