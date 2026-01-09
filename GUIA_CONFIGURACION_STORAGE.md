# Guía de Configuración - Supabase Storage para Promociones

Esta guía te llevará paso a paso para configurar el almacenamiento de imágenes en Supabase.

## Paso 1: Crear el Bucket en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **Storage**
3. Haz clic en **"New bucket"** (Nuevo bucket)
4. Configura el bucket con estos datos:
   - **Name**: `promociones`
   - **Public bucket**: ✅ **SÍ** (marca el checkbox) - Esto permite que las imágenes se vean sin autenticación
   - **File size limit**: `2 MB` (o el tamaño que prefieras)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
5. Haz clic en **"Create bucket"**

## Paso 2: Configurar Políticas de Acceso (RLS)

Después de crear el bucket, necesitas configurar quién puede hacer qué:

### Política 1: Permitir a todos VER las imágenes (público)
```sql
-- En Storage > Policies > New Policy
-- Selecciona: "SELECT" para el bucket "promociones"

CREATE POLICY "Permitir lectura pública de promociones"
ON storage.objects
FOR SELECT
USING (bucket_id = 'promociones');
```

### Política 2: Solo ADMIN puede SUBIR imágenes
```sql
-- En Storage > Policies > New Policy
-- Selecciona: "INSERT" para el bucket "promociones"

CREATE POLICY "Solo admin puede subir promociones"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'promociones'
  AND auth.role() = 'authenticated'
  AND (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin'
);
```

### Política 3: Solo ADMIN puede ACTUALIZAR/ELIMINAR imágenes
```sql
-- Para UPDATE
CREATE POLICY "Solo admin puede actualizar promociones"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'promociones'
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  bucket_id = 'promociones'
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Para DELETE
CREATE POLICY "Solo admin puede eliminar promociones"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'promociones'
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
```

## Paso 3: Verificar la Configuración

Para verificar que todo funciona:

1. Ve a **Storage > promociones**
2. Intenta subir una imagen de prueba manualmente
3. Si se sube correctamente, copia la URL pública
4. Pega la URL en tu navegador - deberías ver la imagen

## Formato de URL de las imágenes

Cuando subas una imagen programáticamente, la URL será:
```
https://[TU-PROJECT-REF].supabase.co/storage/v1/object/public/promociones/[NOMBRE-ARCHIVO]
```

Por ejemplo:
```
https://abcdefgh.supabase.co/storage/v1/object/public/promociones/promo-cafe-123456.jpg
```

## Siguiente Paso

Una vez configurado el Storage, ejecuta la migración SQL que te voy a crear para:
- Tabla de promociones
- Tabla de notificaciones
- Triggers necesarios

---

**Nota**: Si tienes problemas con las políticas, asegúrate de que tu función `is_admin()` esté funcionando correctamente (fue creada en la migración inicial).
