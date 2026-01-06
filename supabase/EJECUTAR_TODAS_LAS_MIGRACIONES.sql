-- =====================================================
-- EJECUTA ESTE ARCHIVO COMPLETO EN SUPABASE SQL EDITOR
-- Incluye todas las migraciones necesarias
-- Fecha: 2026-01-06
-- =====================================================

-- =====================================================
-- MIGRACIÓN 1: Agregar campos anulado a pagos
-- =====================================================
ALTER TABLE pagos
ADD COLUMN IF NOT EXISTS anulado BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS anulado_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_pagos_anulado ON pagos(anulado);

COMMENT ON COLUMN pagos.anulado IS 'Indica si el pago fue anulado (solo admin)';
COMMENT ON COLUMN pagos.anulado_at IS 'Fecha y hora cuando se anuló el pago';

-- =====================================================
-- MIGRACIÓN 2: Arreglar cálculo de saldos (producto cartesiano)
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

-- =====================================================
-- VERIFICACIÓN: Consulta para verificar que todo está correcto
-- =====================================================
-- Ejecuta esta query DESPUÉS de ejecutar todo lo anterior para verificar:
-- SELECT * FROM saldos_usuarios;
--
-- Deberías ver:
-- - user_id
-- - nombre
-- - total_consumido
-- - total_pagado
-- - saldo (debe ser: total_pagado - total_consumido)
