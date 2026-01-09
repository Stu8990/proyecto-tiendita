-- =====================================================
-- MIGRACIÓN: Corregir lógica de promociones
-- Descripción: fecha_promo es fecha de ENTREGA, no de visualización
-- Los usuarios pueden aceptar desde que se crea hasta 1 día antes
-- Fecha: 2026-01-09
-- =====================================================

-- Agregar columna fecha_limite (hasta cuándo pueden aceptar)
ALTER TABLE promociones
ADD COLUMN IF NOT EXISTS fecha_limite DATE;

-- Crear función para calcular fecha límite automáticamente
-- (1 día ANTES de la fecha de entrega - admin tiene día completo para preparar)
CREATE OR REPLACE FUNCTION set_fecha_limite()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si no se especifica fecha_limite, calcular como 1 día antes de fecha_promo
  -- Esto da tiempo al admin para preparar sin sorpresas de última hora
  IF NEW.fecha_limite IS NULL THEN
    NEW.fecha_limite := NEW.fecha_promo - INTERVAL '1 day';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_fecha_limite ON promociones;

CREATE TRIGGER trg_set_fecha_limite
BEFORE INSERT OR UPDATE OF fecha_promo ON promociones
FOR EACH ROW
EXECUTE FUNCTION set_fecha_limite();

-- Actualizar promociones existentes
UPDATE promociones
SET fecha_limite = fecha_promo - INTERVAL '1 day'
WHERE fecha_limite IS NULL;

-- Crear vista para promociones activas vigentes
-- (promociones que están dentro del periodo de aceptación)
CREATE OR REPLACE VIEW promociones_vigentes AS
SELECT
  p.*,
  CURRENT_DATE <= p.fecha_limite AS puede_aceptar,
  p.fecha_promo - CURRENT_DATE AS dias_para_entrega,
  p.fecha_limite - CURRENT_DATE AS dias_para_aceptar
FROM promociones p
WHERE p.activa = true
  AND CURRENT_DATE <= p.fecha_limite
ORDER BY p.fecha_promo ASC;

-- Actualizar vista de stats
DROP VIEW IF EXISTS promociones_stats;

CREATE OR REPLACE VIEW promociones_stats AS
SELECT
  p.id AS promocion_id,
  p.titulo,
  p.descripcion,
  p.producto,
  p.precio,
  p.fecha_promo,
  p.fecha_limite,
  p.imagen_url,
  p.activa,
  p.fecha_creacion,
  CURRENT_DATE <= p.fecha_limite AS puede_aceptar,
  p.fecha_promo - CURRENT_DATE AS dias_para_entrega,
  p.fecha_limite - CURRENT_DATE AS dias_para_aceptar,
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
GROUP BY p.id, p.titulo, p.descripcion, p.producto, p.precio, p.fecha_promo, p.fecha_limite, p.imagen_url, p.activa, p.fecha_creacion
ORDER BY p.fecha_promo DESC, p.fecha_creacion DESC;

-- Comentarios
COMMENT ON COLUMN promociones.fecha_promo IS 'Fecha de ENTREGA del producto';
COMMENT ON COLUMN promociones.fecha_limite IS 'Hasta cuándo pueden aceptar (1 día antes de entrega - da tiempo para preparar)';
COMMENT ON VIEW promociones_vigentes IS 'Promociones activas que están dentro del periodo de aceptación';
COMMENT ON FUNCTION set_fecha_limite() IS 'Calcula fecha_limite = fecha_promo - 1 día (cierre anticipado)';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ver promociones vigentes (que usuarios pueden aceptar HOY):
-- SELECT * FROM promociones_vigentes;
--
-- Ver estadísticas con tiempo restante:
-- SELECT
--   titulo,
--   fecha_promo,
--   fecha_limite,
--   dias_para_aceptar,
--   total_aceptadas
-- FROM promociones_stats;
