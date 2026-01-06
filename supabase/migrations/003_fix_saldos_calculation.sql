-- =====================================================
-- MIGRACIÓN: Arreglar cálculo de saldos
-- Descripción: Soluciona el producto cartesiano que duplicaba valores
-- Fecha: 2026-01-06
-- =====================================================

-- Eliminar la vista incorrecta
DROP VIEW IF EXISTS saldos_usuarios;

-- Crear vista correcta usando subconsultas para evitar producto cartesiano
CREATE OR REPLACE VIEW saldos_usuarios AS
SELECT
  p.id AS user_id,
  p.nombre,
  COALESCE(consumos.total, 0) AS total_consumido,
  COALESCE(pagos.total, 0) AS total_pagado,
  COALESCE(pagos.total, 0) - COALESCE(consumos.total, 0) AS saldo
FROM profiles p
LEFT JOIN (
  -- Subconsulta para sumar consumos no anulados por usuario
  SELECT
    user_id,
    SUM(total) AS total
  FROM consumos
  WHERE anulado = false
  GROUP BY user_id
) consumos ON consumos.user_id = p.id
LEFT JOIN (
  -- Subconsulta para sumar pagos no anulados por usuario
  SELECT
    user_id,
    SUM(monto) AS total
  FROM pagos
  WHERE anulado = false
  GROUP BY user_id
) pagos ON pagos.user_id = p.id
ORDER BY p.nombre;

-- Comentario
COMMENT ON VIEW saldos_usuarios IS 'Vista de saldos por usuario (arreglada para evitar duplicación de valores)';
