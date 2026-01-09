# Migraciones de Base de Datos

## Problema Identificado

La función de anular pagos no funcionaba porque la política RLS (Row Level Security) de la tabla `pagos` no permitía hacer UPDATE a nadie, ni siquiera a los administradores.

## Solución

Se creó la migración `004_allow_admin_update_pagos.sql` que:

1. **Actualiza la política RLS** para permitir a los admin hacer UPDATE en pagos
2. **Crea un trigger** para garantizar que solo se pueden anular pagos (no modificar otros campos como monto, usuario, etc.)
3. **Protege contra reversión** de anulaciones (un pago anulado no se puede "des-anular")

## Cómo Aplicar la Migración

### Opción 1: Ejecutar solo la migración nueva

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo: `004_allow_admin_update_pagos.sql`
4. Ejecuta el SQL

### Opción 2: Ejecutar todas las migraciones (recomendado si es primera vez)

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo: `EJECUTAR_TODAS_LAS_MIGRACIONES.sql`
4. Ejecuta el SQL

## Verificación

Después de ejecutar la migración, verifica que funciona:

1. Inicia sesión como admin en tu aplicación
2. Ve a la sección de "Todos los Pagos"
3. Intenta anular un pago
4. Deberías ver:
   - El modal de confirmación con la mascota
   - El pago se marca como "ANULADO" en la interfaz
   - El pago aparece como anulado en Supabase

## Estructura de Archivos

```
supabase/migrations/
├── 001_initial_schema.sql              # Schema inicial (ya ejecutado)
├── 002_add_anulado_to_pagos.sql        # Agrega campos de anulación (ya ejecutado)
├── 003_fix_saldos_calculation.sql      # Arregla cálculo de saldos (ya ejecutado)
├── 004_allow_admin_update_pagos.sql    # 🆕 Permite anular pagos (NUEVA)
└── EJECUTAR_TODAS_LAS_MIGRACIONES.sql  # Ejecuta todas las migraciones
```

## Notas Técnicas

- La migración es **idempotente**: puedes ejecutarla múltiples veces sin problemas
- Usa `DROP ... IF EXISTS` para evitar errores si la política/trigger ya existe
- El trigger `enforce_pagos_only_annulment()` es similar al de consumos
- Solo los admin pueden anular pagos (verificado por la política RLS)
