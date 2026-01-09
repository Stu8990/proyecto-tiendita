-- =====================================================
-- MIGRACIÓN: Agregar fecha de vigencia a promociones
-- Descripción: Permite que admin programe promos para días específicos
-- Fecha: 2026-01-09
-- =====================================================

-- Agregar columna fecha_promo (fecha para la cual es válida la promoción)
ALTER TABLE promociones
ADD COLUMN IF NOT EXISTS fecha_promo DATE NOT NULL DEFAULT CURRENT_DATE;

-- Crear índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_promociones_fecha_promo ON promociones(fecha_promo);

-- Modificar constraint de promo activa para que solo haya una por fecha
-- Primero eliminamos el constraint anterior
ALTER TABLE promociones
DROP CONSTRAINT IF EXISTS solo_una_activa;

-- Crear nuevo constraint: solo una promo activa por fecha
ALTER TABLE promociones
ADD CONSTRAINT solo_una_activa_por_fecha
  EXCLUDE (fecha_promo WITH =)
  WHERE (activa = true);

-- Crear vista para estadísticas de promociones
CREATE OR REPLACE VIEW promociones_stats AS
SELECT
  p.id AS promocion_id,
  p.titulo,
  p.descripcion,
  p.producto,
  p.precio,
  p.fecha_promo,
  p.imagen_url,
  p.activa,
  p.fecha_creacion,
  COUNT(pv.id) FILTER (WHERE pv.aceptada = true) AS total_aceptadas,
  COUNT(pv.id) FILTER (WHERE pv.aceptada = false) AS total_rechazadas,
  COUNT(pv.id) AS total_vistas,
  COALESCE(
    json_agg(
      json_build_object(
        'user_id', prof.id,
        'nombre', prof.nombre,
        'aceptada', pv.aceptada,
        'fecha', pv.vista_at
      ) ORDER BY pv.vista_at DESC
    ) FILTER (WHERE pv.id IS NOT NULL),
    '[]'::json
  ) AS usuarios_detalle
FROM promociones p
LEFT JOIN promociones_vistas pv ON pv.promocion_id = p.id
LEFT JOIN profiles prof ON prof.id = pv.user_id
GROUP BY p.id, p.titulo, p.descripcion, p.producto, p.precio, p.fecha_promo, p.imagen_url, p.activa, p.fecha_creacion
ORDER BY p.fecha_promo DESC, p.fecha_creacion DESC;

-- Modificar función de desactivar promos anteriores
-- Ahora debe desactivar solo las de la misma fecha
-- Primero eliminamos el trigger, luego la función
DROP TRIGGER IF EXISTS trg_desactivar_promos_anteriores ON promociones;
DROP FUNCTION IF EXISTS desactivar_promociones_anteriores() CASCADE;

CREATE OR REPLACE FUNCTION desactivar_promociones_anteriores()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si la nueva promo es activa, desactivar todas las demás DE LA MISMA FECHA
  IF NEW.activa = true THEN
    UPDATE promociones
    SET activa = false
    WHERE id != NEW.id
      AND activa = true
      AND fecha_promo = NEW.fecha_promo;
  END IF;

  RETURN NEW;
END;
$$;

-- Recrear trigger
DROP TRIGGER IF EXISTS trg_desactivar_promos_anteriores ON promociones;

CREATE TRIGGER trg_desactivar_promos_anteriores
BEFORE INSERT OR UPDATE OF activa ON promociones
FOR EACH ROW
WHEN (NEW.activa = true)
EXECUTE FUNCTION desactivar_promociones_anteriores();

-- Comentarios
COMMENT ON COLUMN promociones.fecha_promo IS 'Fecha para la cual es válida la promoción (ej: mañana)';
COMMENT ON VIEW promociones_stats IS 'Vista con estadísticas de aceptaciones por promoción';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- SELECT * FROM promociones_stats;
--
-- Deberías ver:
-- - promocion_id
-- - titulo, descripcion, producto, precio
-- - fecha_promo (fecha programada)
-- - total_aceptadas (cuántos aceptaron)
-- - total_rechazadas (cuántos rechazaron)
-- - usuarios_detalle (lista de usuarios)
