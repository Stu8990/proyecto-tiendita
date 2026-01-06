-- =====================================================
-- BAR DEUDAS PWA - SCHEMA INICIAL (SUPABASE)
-- Migration: 001_initial_schema.sql
-- Descripción: Crea tablas, vista, funciones, triggers y políticas RLS
-- =====================================================

-- =====================================================
-- EXTENSIONES
-- =====================================================
-- Opción clásica:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- (Opcional recomendado) Si prefieres gen_random_uuid() en vez de uuid_generate_v4():
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: profiles
-- Descripción: Perfil de usuario con rol (user o admin)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =====================================================
-- TABLA: consumos
-- Descripción: Registro de consumos de usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS consumos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- o gen_random_uuid()
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  producto TEXT NOT NULL,
  cantidad NUMERIC NOT NULL CHECK (cantidad > 0),
  valor_unitario NUMERIC NOT NULL CHECK (valor_unitario > 0),
  total NUMERIC GENERATED ALWAYS AS (cantidad * valor_unitario) STORED,
  anulado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  anulado_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_consumos_user_id ON consumos(user_id);
CREATE INDEX IF NOT EXISTS idx_consumos_created_at ON consumos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consumos_anulado ON consumos(anulado);

-- =====================================================
-- TABLA: pagos
-- Descripción: Registro de pagos de usuarios (solo admin)
-- =====================================================
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- o gen_random_uuid()
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL CHECK (monto > 0),
  registrado_por UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_user_id ON pagos(user_id);
CREATE INDEX IF NOT EXISTS idx_pagos_created_at ON pagos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pagos_registrado_por ON pagos(registrado_por);

-- =====================================================
-- VISTA: saldos_usuarios
-- Descripción: total_pagado - total_consumido_no_anulado
-- =====================================================
CREATE OR REPLACE VIEW saldos_usuarios AS
SELECT
  p.id AS user_id,
  p.nombre,
  COALESCE(SUM(CASE WHEN c.anulado = false THEN c.total ELSE 0 END), 0) AS total_consumido,
  COALESCE(SUM(pg.monto), 0) AS total_pagado,
  COALESCE(SUM(pg.monto), 0) - COALESCE(SUM(CASE WHEN c.anulado = false THEN c.total ELSE 0 END), 0) AS saldo
FROM profiles p
LEFT JOIN consumos c ON c.user_id = p.id
LEFT JOIN pagos pg ON pg.user_id = p.id
GROUP BY p.id, p.nombre;

-- =====================================================
-- FUNCIÓN: is_admin()
-- Descripción: Verifica si el usuario actual es admin
-- Nota: SECURITY DEFINER para poder leer profiles bajo RLS
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

-- =====================================================
-- TRIGGER: create_profile_on_signup
-- Descripción: Crea automáticamente un perfil al registrarse
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, nombre, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', SPLIT_PART(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- TRIGGER: enforce_consumos_only_annulment
-- Descripción:
--   Permite UPDATE solo para anulación lógica:
--   - No permite cambiar user_id, producto, cantidad, valor_unitario, created_at
--   - Si anulado pasa a true y anulado_at es NULL => setea NOW()
--   - No permite revertir anulación (true -> false)
-- =====================================================
CREATE OR REPLACE FUNCTION enforce_consumos_only_annulment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Bloquear cambios de columnas "no permitidas"
  IF (NEW.user_id IS DISTINCT FROM OLD.user_id)
     OR (NEW.producto IS DISTINCT FROM OLD.producto)
     OR (NEW.cantidad IS DISTINCT FROM OLD.cantidad)
     OR (NEW.valor_unitario IS DISTINCT FROM OLD.valor_unitario)
     OR (NEW.created_at IS DISTINCT FROM OLD.created_at) THEN
    RAISE EXCEPTION 'Solo se permite anular consumos (campos anulado y anulado_at).';
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

DROP TRIGGER IF EXISTS trg_consumos_only_annulment ON consumos;

CREATE TRIGGER trg_consumos_only_annulment
BEFORE UPDATE ON consumos
FOR EACH ROW
EXECUTE FUNCTION enforce_consumos_only_annulment();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS: profiles
-- =====================================================

DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() = id OR is_admin()
  );

DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
CREATE POLICY "profiles_delete_policy"
  ON profiles
  FOR DELETE
  USING (false);

-- =====================================================
-- POLÍTICAS RLS: consumos
-- =====================================================

DROP POLICY IF EXISTS "consumos_select_policy" ON consumos;
CREATE POLICY "consumos_select_policy"
  ON consumos
  FOR SELECT
  USING (
    auth.uid() = user_id OR is_admin()
  );

DROP POLICY IF EXISTS "consumos_insert_policy" ON consumos;
CREATE POLICY "consumos_insert_policy"
  ON consumos
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR is_admin()
  );

-- UPDATE: dueño o admin. (La restricción de columnas la hace el trigger)
DROP POLICY IF EXISTS "consumos_update_policy" ON consumos;
CREATE POLICY "consumos_update_policy"
  ON consumos
  FOR UPDATE
  USING (
    auth.uid() = user_id OR is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id OR is_admin()
  );

DROP POLICY IF EXISTS "consumos_delete_policy" ON consumos;
CREATE POLICY "consumos_delete_policy"
  ON consumos
  FOR DELETE
  USING (false);

-- =====================================================
-- POLÍTICAS RLS: pagos
-- =====================================================

DROP POLICY IF EXISTS "pagos_select_policy" ON pagos;
CREATE POLICY "pagos_select_policy"
  ON pagos
  FOR SELECT
  USING (
    auth.uid() = user_id OR is_admin()
  );

DROP POLICY IF EXISTS "pagos_insert_policy" ON pagos;
CREATE POLICY "pagos_insert_policy"
  ON pagos
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "pagos_update_policy" ON pagos;
CREATE POLICY "pagos_update_policy"
  ON pagos
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "pagos_delete_policy" ON pagos;
CREATE POLICY "pagos_delete_policy"
  ON pagos
  FOR DELETE
  USING (false);

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE profiles IS 'Perfiles de usuarios con roles (user/admin)';
COMMENT ON TABLE consumos IS 'Registro de consumos con anulación lógica';
COMMENT ON TABLE pagos IS 'Registro de pagos realizados (solo admin)';
COMMENT ON VIEW saldos_usuarios IS 'Vista que calcula el saldo de cada usuario';
COMMENT ON FUNCTION is_admin() IS 'Verifica si el usuario actual es administrador';
COMMENT ON FUNCTION handle_new_user() IS 'Crea automáticamente un perfil al registrar un usuario';
COMMENT ON FUNCTION enforce_consumos_only_annulment() IS 'Restringe UPDATE en consumos a anulación lógica';

-- =====================================================
-- FIN
-- =====================================================
