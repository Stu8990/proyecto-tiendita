-- =====================================================
-- MIGRACIÓN: Sistema de Promociones y Notificaciones
-- Descripción: Agrega tablas para promociones diarias y notificaciones al admin
-- Fecha: 2026-01-09
-- =====================================================

-- =====================================================
-- TABLA: promociones
-- Descripción: Promociones diarias creadas por admin
-- =====================================================
CREATE TABLE IF NOT EXISTS promociones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio NUMERIC NOT NULL CHECK (precio > 0),
  producto TEXT NOT NULL, -- nombre del producto asociado
  imagen_url TEXT NULL, -- URL de la imagen en Supabase Storage (opcional)
  activa BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creado_por UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,

  -- Solo puede haber una promoción activa a la vez
  CONSTRAINT solo_una_activa EXCLUDE (activa WITH =) WHERE (activa = true)
);

CREATE INDEX IF NOT EXISTS idx_promociones_activa ON promociones(activa) WHERE activa = true;
CREATE INDEX IF NOT EXISTS idx_promociones_fecha ON promociones(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_promociones_creado_por ON promociones(creado_por);

-- =====================================================
-- TABLA: notificaciones
-- Descripción: Notificaciones para admin cuando usuarios aceptan promos
-- =====================================================
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (tipo IN ('promo_aceptada', 'pago_registrado', 'otro')),
  mensaje TEXT NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT false,

  -- Relaciones opcionales dependiendo del tipo
  user_id UUID NULL REFERENCES profiles(id) ON DELETE CASCADE, -- usuario que generó la notif
  promocion_id UUID NULL REFERENCES promociones(id) ON DELETE SET NULL, -- promo relacionada
  consumo_id UUID NULL REFERENCES consumos(id) ON DELETE SET NULL, -- consumo relacionado

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida) WHERE leida = false;
CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at ON notificaciones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);

-- =====================================================
-- TABLA: promociones_vistas
-- Descripción: Registro de qué usuarios han visto qué promociones
-- Para mostrar el modal solo con promos nuevas
-- =====================================================
CREATE TABLE IF NOT EXISTS promociones_vistas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  promocion_id UUID NOT NULL REFERENCES promociones(id) ON DELETE CASCADE,
  vista_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  aceptada BOOLEAN NOT NULL DEFAULT false,

  -- Un usuario solo puede ver una promo una vez
  CONSTRAINT unique_user_promo UNIQUE (user_id, promocion_id)
);

CREATE INDEX IF NOT EXISTS idx_promociones_vistas_user ON promociones_vistas(user_id);
CREATE INDEX IF NOT EXISTS idx_promociones_vistas_promo ON promociones_vistas(promocion_id);

-- =====================================================
-- FUNCIÓN: Crear notificación cuando se acepta promo
-- =====================================================
CREATE OR REPLACE FUNCTION notify_admin_promo_aceptada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usuario_nombre TEXT;
  promo_titulo TEXT;
BEGIN
  -- Solo crear notificación si la promo fue aceptada
  IF NEW.aceptada = true THEN
    -- Obtener nombre del usuario
    SELECT nombre INTO usuario_nombre
    FROM profiles
    WHERE id = NEW.user_id;

    -- Obtener título de la promoción
    SELECT titulo INTO promo_titulo
    FROM promociones
    WHERE id = NEW.promocion_id;

    -- Crear notificación para admin
    INSERT INTO notificaciones (tipo, mensaje, user_id, promocion_id)
    VALUES (
      'promo_aceptada',
      usuario_nombre || ' aceptó la promoción: ' || promo_titulo,
      NEW.user_id,
      NEW.promocion_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_promo_aceptada ON promociones_vistas;

CREATE TRIGGER trg_notify_promo_aceptada
AFTER INSERT OR UPDATE OF aceptada ON promociones_vistas
FOR EACH ROW
EXECUTE FUNCTION notify_admin_promo_aceptada();

-- =====================================================
-- FUNCIÓN: Desactivar promociones anteriores
-- Asegura que solo haya una promo activa
-- =====================================================
CREATE OR REPLACE FUNCTION desactivar_promociones_anteriores()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si la nueva promo es activa, desactivar todas las demás
  IF NEW.activa = true THEN
    UPDATE promociones
    SET activa = false
    WHERE id != NEW.id AND activa = true;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_desactivar_promos_anteriores ON promociones;

CREATE TRIGGER trg_desactivar_promos_anteriores
BEFORE INSERT OR UPDATE OF activa ON promociones
FOR EACH ROW
WHEN (NEW.activa = true)
EXECUTE FUNCTION desactivar_promociones_anteriores();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones_vistas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS: promociones
-- =====================================================

-- Todos pueden VER promociones activas
DROP POLICY IF EXISTS "promociones_select_policy" ON promociones;
CREATE POLICY "promociones_select_policy"
  ON promociones
  FOR SELECT
  USING (
    activa = true OR is_admin()
  );

-- Solo admin puede INSERTAR promociones
DROP POLICY IF EXISTS "promociones_insert_policy" ON promociones;
CREATE POLICY "promociones_insert_policy"
  ON promociones
  FOR INSERT
  WITH CHECK (is_admin());

-- Solo admin puede ACTUALIZAR promociones
DROP POLICY IF EXISTS "promociones_update_policy" ON promociones;
CREATE POLICY "promociones_update_policy"
  ON promociones
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Solo admin puede ELIMINAR promociones
DROP POLICY IF EXISTS "promociones_delete_policy" ON promociones;
CREATE POLICY "promociones_delete_policy"
  ON promociones
  FOR DELETE
  USING (is_admin());

-- =====================================================
-- POLÍTICAS RLS: notificaciones
-- =====================================================

-- Solo admin puede VER notificaciones
DROP POLICY IF EXISTS "notificaciones_select_policy" ON notificaciones;
CREATE POLICY "notificaciones_select_policy"
  ON notificaciones
  FOR SELECT
  USING (is_admin());

-- Sistema puede INSERTAR notificaciones (trigger)
DROP POLICY IF EXISTS "notificaciones_insert_policy" ON notificaciones;
CREATE POLICY "notificaciones_insert_policy"
  ON notificaciones
  FOR INSERT
  WITH CHECK (true); -- El trigger se encarga de la lógica

-- Solo admin puede ACTUALIZAR (marcar como leída)
DROP POLICY IF EXISTS "notificaciones_update_policy" ON notificaciones;
CREATE POLICY "notificaciones_update_policy"
  ON notificaciones
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Solo admin puede ELIMINAR
DROP POLICY IF EXISTS "notificaciones_delete_policy" ON notificaciones;
CREATE POLICY "notificaciones_delete_policy"
  ON notificaciones
  FOR DELETE
  USING (is_admin());

-- =====================================================
-- POLÍTICAS RLS: promociones_vistas
-- =====================================================

-- Usuarios ven sus propios registros, admin ve todo
DROP POLICY IF EXISTS "promociones_vistas_select_policy" ON promociones_vistas;
CREATE POLICY "promociones_vistas_select_policy"
  ON promociones_vistas
  FOR SELECT
  USING (
    auth.uid() = user_id OR is_admin()
  );

-- Usuarios pueden INSERTAR sus propios registros
DROP POLICY IF EXISTS "promociones_vistas_insert_policy" ON promociones_vistas;
CREATE POLICY "promociones_vistas_insert_policy"
  ON promociones_vistas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden ACTUALIZAR sus propios registros
DROP POLICY IF EXISTS "promociones_vistas_update_policy" ON promociones_vistas;
CREATE POLICY "promociones_vistas_update_policy"
  ON promociones_vistas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Nadie puede ELIMINAR
DROP POLICY IF EXISTS "promociones_vistas_delete_policy" ON promociones_vistas;
CREATE POLICY "promociones_vistas_delete_policy"
  ON promociones_vistas
  FOR DELETE
  USING (false);

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE promociones IS 'Promociones diarias creadas por admin';
COMMENT ON TABLE notificaciones IS 'Notificaciones para admin sobre eventos del sistema';
COMMENT ON TABLE promociones_vistas IS 'Registro de promociones vistas/aceptadas por usuarios';
COMMENT ON FUNCTION notify_admin_promo_aceptada() IS 'Crea notificación cuando usuario acepta promoción';
COMMENT ON FUNCTION desactivar_promociones_anteriores() IS 'Asegura que solo haya una promoción activa';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ejecuta estas queries DESPUÉS de la migración para verificar:
-- SELECT * FROM promociones;
-- SELECT * FROM notificaciones;
-- SELECT * FROM promociones_vistas;
