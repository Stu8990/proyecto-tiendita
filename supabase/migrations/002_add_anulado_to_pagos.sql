-- =====================================================
-- MIGRACIÓN: Agregar campos de anulación a pagos
-- Descripción: Permite anular pagos similares a consumos
-- Fecha: 2026-01-05
-- =====================================================

-- Agregar columnas anulado y anulado_at a la tabla pagos
ALTER TABLE pagos
ADD COLUMN IF NOT EXISTS anulado BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS anulado_at TIMESTAMPTZ NULL;

-- Crear índice para búsquedas por pagos anulados
CREATE INDEX IF NOT EXISTS idx_pagos_anulado ON pagos(anulado);

-- Actualizar la vista saldos_usuarios para excluir pagos anulados
-- NOTA: Esta vista será reemplazada por la migración 003 que arregla el cálculo

-- Comentarios
COMMENT ON COLUMN pagos.anulado IS 'Indica si el pago fue anulado (solo admin)';
COMMENT ON COLUMN pagos.anulado_at IS 'Fecha y hora cuando se anuló el pago';
