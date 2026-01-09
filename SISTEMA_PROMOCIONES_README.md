# Sistema de Promociones y Notificaciones

## Resumen del Sistema

Este sistema permite a los administradores crear promociones diarias que se muestran automáticamente a los usuarios mediante un modal atractivo. Cuando un usuario acepta una promoción, se registra el consumo automáticamente y se notifica al admin.

## Características Principales

### Para Usuarios (No-Admin)
- ✅ Modal de promoción que aparece **solo si hay una promo nueva** que no han visto
- ✅ Imagen de la mascota saludando (`mascotasaludo.png`) a la izquierda
- ✅ Información de la promo: título, descripción, precio
- ✅ Imagen opcional del producto (si el admin la subió)
- ✅ Botones para aceptar o rechazar la promoción
- ✅ Al aceptar: registra consumo automáticamente

### Para Administradores
- ✅ Crear/editar promociones diarias
- ✅ Subir imagen opcional del producto
- ✅ Solo una promoción activa a la vez
- ✅ Ver notificaciones de usuarios que aceptaron promos
- ✅ Sistema de notificaciones en tiempo real

## Arquitectura de Datos

### Tabla: `promociones`
```sql
- id (UUID)
- titulo (TEXT)              # Ej: "Café del Día"
- descripcion (TEXT)         # Ej: "Café americano grande con galleta"
- precio (NUMERIC)           # Ej: 2500
- producto (TEXT)            # Ej: "Café Americano Grande"
- imagen_url (TEXT)          # URL opcional de Supabase Storage
- activa (BOOLEAN)           # Solo una puede estar activa
- fecha_creacion (TIMESTAMP)
- creado_por (UUID)          # Referencia al admin
```

### Tabla: `notificaciones`
```sql
- id (UUID)
- tipo (TEXT)                # 'promo_aceptada', 'pago_registrado', etc.
- mensaje (TEXT)             # Ej: "Juan aceptó la promoción: Café del Día"
- leida (BOOLEAN)
- user_id (UUID)             # Usuario que generó la notif
- promocion_id (UUID)        # Promo relacionada
- consumo_id (UUID)          # Consumo relacionado
- created_at (TIMESTAMP)
```

### Tabla: `promociones_vistas`
```sql
- id (UUID)
- user_id (UUID)             # Usuario
- promocion_id (UUID)        # Promoción vista
- vista_at (TIMESTAMP)       # Cuándo la vio
- aceptada (BOOLEAN)         # Si aceptó o rechazó
```

## Flujo de Trabajo

### 1. Admin crea una promoción
```
1. Admin va a "Promociones" en el dashboard
2. Llena formulario: título, descripción, precio, producto
3. (Opcional) Sube imagen del producto
4. Hace clic en "Crear Promoción"
5. La promo anterior se desactiva automáticamente
6. La nueva promo queda como "activa"
```

### 2. Usuario ve la promoción
```
1. Usuario inicia sesión
2. App verifica si hay promo activa que NO haya visto
3. Si hay promo nueva → Muestra modal
4. Usuario ve:
   - Mascota saludando (izquierda)
   - Título y descripción
   - Precio
   - Imagen del producto (si existe)
5. Opciones: "Sí, quiero" o "No, gracias"
```

### 3. Usuario acepta la promoción
```
1. Usuario hace clic en "Sí, quiero"
2. Se registra en promociones_vistas (aceptada=true)
3. Se crea consumo automáticamente
4. TRIGGER crea notificación para admin
5. Admin recibe notif: "Juan aceptó la promoción: Café del Día"
6. Modal se cierra
```

## Instrucciones de Configuración

### Paso 1: Configurar Supabase Storage
**Sigue la guía:** `GUIA_CONFIGURACION_STORAGE.md`

Resumen:
1. Crear bucket "promociones" (público)
2. Configurar políticas RLS para el bucket
3. Verificar subiendo una imagen de prueba

### Paso 2: Ejecutar Migración SQL
**Archivo:** `supabase/migrations/005_add_promociones_y_notificaciones.sql`

1. Ve a Supabase > SQL Editor
2. Copia y pega el contenido del archivo
3. Ejecuta el SQL
4. Verifica con:
   ```sql
   SELECT * FROM promociones;
   SELECT * FROM notificaciones;
   SELECT * FROM promociones_vistas;
   ```

### Paso 3: Verificar Políticas RLS

Asegúrate de que las políticas se crearon correctamente:

```sql
-- Ver políticas de promociones
SELECT * FROM pg_policies WHERE tablename = 'promociones';

-- Ver políticas de notificaciones
SELECT * FROM pg_policies WHERE tablename = 'notificaciones';

-- Ver políticas de promociones_vistas
SELECT * FROM pg_policies WHERE tablename = 'promociones_vistas';
```

## Estructura de Archivos del Proyecto

```
proyecto-tiendita/
├── GUIA_CONFIGURACION_STORAGE.md    # Guía para configurar Storage
├── SISTEMA_PROMOCIONES_README.md    # Este archivo
├── supabase/
│   └── migrations/
│       └── 005_add_promociones_y_notificaciones.sql
├── src/
│   ├── components/
│   │   ├── promociones/
│   │   │   ├── PromoModal.jsx          # Modal para usuarios
│   │   │   ├── PromoForm.jsx           # Formulario admin crear promo
│   │   │   └── PromoList.jsx           # Lista de promos (admin)
│   │   └── notificaciones/
│   │       ├── NotificationBadge.jsx   # Contador de notifs
│   │       └── NotificationList.jsx    # Lista de notifs
│   └── hooks/
│       ├── usePromociones.jsx          # Hook para promos
│       └── useNotificaciones.jsx       # Hook para notifs
```

## Funcionalidades Implementadas

### ✅ Base de Datos
- [x] Tabla promociones
- [x] Tabla notificaciones
- [x] Tabla promociones_vistas
- [x] Triggers automáticos
- [x] Políticas RLS
- [x] Solo una promo activa (constraint)

### 🔄 Pendiente (siguiente paso)
- [ ] Hook usePromociones
- [ ] Hook useNotificaciones
- [ ] Componente PromoModal
- [ ] Componente PromoForm (admin)
- [ ] Componente NotificationBadge
- [ ] Subida de imágenes a Storage
- [ ] Integración con Layout

## Próximos Pasos

1. **Crear hooks** para manejar promociones y notificaciones
2. **Crear PromoModal** que se muestre a los usuarios
3. **Crear panel admin** para gestionar promociones
4. **Crear sistema de notificaciones** visual para admin
5. **Integrar todo** en el Layout y Dashboard

---

¿Listo para continuar? Dime cuando hayas configurado el Storage y ejecutado la migración.
