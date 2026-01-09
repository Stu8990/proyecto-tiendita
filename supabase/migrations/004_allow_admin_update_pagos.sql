-- =====================================================
-- MIGRACIÓN: Permitir a admin anular pagos
-- Descripción: Actualiza la política RLS para permitir a admin hacer UPDATE en pagos (anulación)
-- Fecha: 2026-01-09
-- =====================================================

-- Eliminar la política de UPDATE actual (que bloquea todo)
DROP POLICY IF EXISTS "pagos_update_policy" ON pagos;

-- Crear nueva política que permite a admin hacer UPDATE
-- Similar a la de consumos, pero solo admin puede anular pagos
CREATE POLICY "pagos_update_policy"
  ON pagos
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Crear trigger para garantizar que solo se pueden anular pagos (no modificar otros campos)
CREATE OR REPLACE FUNCTION enforce_pagos_only_annulment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Bloquear cambios de columnas "no permitidas"
  IF (NEW.user_id IS DISTINCT FROM OLD.user_id)
     OR (NEW.monto IS DISTINCT FROM OLD.monto)
     OR (NEW.registrado_por IS DISTINCT FROM OLD.registrado_por)
     OR (NEW.created_at IS DISTINCT FROM OLD.created_at) THEN
    RAISE EXCEPTION 'Solo se permite anular pagos (campos anulado y anulado_at).';
  END IF;

  -- Si anulado pasa a true, setear timestamp si no viene
  IF NEW.anulado = true AND NEW.anulado_at IS NULL THEN
    NEW.anulado_at := NOW();
  END IF;

  -- No permitir des-anular
  IF OLD.anulado = true AND NEW.anulado = false THEN
    RAISE EXCEPTION 'No se permite revertir la anulación.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pagos_only_annulment ON pagos;

CREATE TRIGGER trg_pagos_only_annulment
BEFORE UPDATE ON pagos
FOR EACH ROW
EXECUTE FUNCTION enforce_pagos_only_annulment();

-- Comentarios
COMMENT ON FUNCTION enforce_pagos_only_annulment() IS 'Restringe UPDATE en pagos a anulación lógica (solo admin)';
