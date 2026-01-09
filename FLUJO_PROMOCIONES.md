# 📅 Flujo de Promociones - Explicación Completa

## Cómo Funciona el Sistema

El sistema está diseñado para que **NO haya desperdicios** y el admin tenga **tiempo para preparar**.

### Ejemplo Práctico: Sandwiches de Pollo

#### **Lunes (Día 1)** - Admin programa
```
Admin en dashboard:
→ "Nueva Promoción" 🎉
→ Título: "Sandwiches de Pollo"
→ Descripción: "Sandwich con pechuga, lechuga, tomate"
→ Producto: "Sandwich de Pollo"
→ Precio: $3000
→ Fecha de entrega: Lunes 15 (7 días después)
→ [Crear Promoción]

Sistema calcula automáticamente:
✅ Fecha de entrega: Lunes 15
✅ Cierre de pedidos: Domingo 14 (1 día antes)
```

#### **Lunes 1 - Domingo 14** - Usuarios aceptan
```
Usuario1 (Martes):
→ Inicia sesión
→ Modal aparece: "Sandwiches de Pollo"
→ "📅 Entrega: lunes 15"
→ [Sí, quiero] ✅
→ Se registra consumo automáticamente

Usuario2 (Jueves):
→ Inicia sesión
→ Ve la misma promo
→ [No, gracias] ❌

Usuario3 (Domingo 14 - último día):
→ Inicia sesión
→ Ve la promo
→ [Sí, quiero] ✅
```

#### **Domingo 14** - Cierre automático
```
23:59:59 → Ya no se puede aceptar
00:00:00 (Lunes) → Modal ya no aparece

Admin en "Estadísticas Promos" 📊:
→ Ve: "15 aceptaron"
→ Ve lista de quiénes (Juan, María, Carlos...)
→ "💡 Preparar: 15 Sandwiches de Pollo"
```

#### **Lunes 15 AM** - Admin prepara
```
Admin tiene TODO EL DÍA para:
✅ Comprar ingredientes si falta
✅ Preparar 15 sandwiches (número exacto)
✅ Sin sorpresas de última hora
```

#### **Lunes 15 PM** - Entrega
```
Admin entrega los 15 sandwiches a quienes aceptaron
✅ Sin desperdicios
✅ Sin faltar
✅ Todos contentos
```

## Ventajas del Sistema

### ✅ Para Admin
1. **Número exacto**: Sabes cuántos preparar
2. **Tiempo de preparación**: Día completo sin sorpresas
3. **Sin desperdicios**: Solo haces lo que se pidió
4. **Visibilidad**: Sabes quiénes pidieron

### ✅ Para Usuarios
1. **Planificación anticipada**: Pueden agendar con días de anticipación
2. **Sin presión**: Tienen hasta 1 día antes para decidir
3. **Información clara**: Ven fecha de entrega en el modal

## Configuración del Sistema

### Paso 1: Ejecutar Migraciones
```sql
-- En Supabase > SQL Editor
-- Ejecuta en orden:
1. 006_add_fecha_promo.sql
2. 007_fix_promo_logic.sql
```

### Paso 2: Crear Promoción (Admin)
1. Dashboard Admin > "Nueva Promoción" 🎉
2. Llenar formulario:
   - Título
   - Descripción
   - Producto
   - Precio
   - **Fecha de entrega** (ej: 7 días después)
   - Imagen (opcional)
3. Ver preview:
   - "📅 Fecha de entrega: [fecha]"
   - "⏰ Cierre de pedidos: [1 día antes]"
4. Crear

### Paso 3: Ver Estadísticas (Admin)
1. Dashboard Admin > "Estadísticas Promos" 📊
2. Ver todas las promos:
   - 🟢 "7 días - Aceptando" (todavía aceptan)
   - 🔴 "MAÑANA - Último día" (cierre mañana)
   - 🟡 "MAÑANA - Entrega (Preparando)" (ya cerró, entrega mañana)
   - 🔴 "HOY - ENTREGA" (día de entrega)
   - 🔵 "ENTREGADA" (ya pasó)
3. Click para expandir y ver quiénes aceptaron
4. "💡 Preparar: X [producto]"

## Estados de las Promociones

| Estado | Descripción | Pueden Aceptar | Admin |
|--------|-------------|----------------|-------|
| 🟢 "7 días - Aceptando" | Faltan varios días | ✅ Sí | Esperar |
| 🟡 "2 días - Aceptando" | Faltan 2 días | ✅ Sí | Esperar |
| 🔴 "MAÑANA - Último día" | Cierre mañana | ✅ Sí | Esperar |
| 🟡 "MAÑANA - Entrega" | Cierre cerrado | ❌ No | **Preparar** |
| 🔴 "HOY - ENTREGA" | Hoy entrega | ❌ No | **Entregar** |
| 🔵 "ENTREGADA" | Ya pasó | ❌ No | Archivada |

## Notificaciones en Tiempo Real

Cuando un usuario acepta:
```
Usuario acepta promo
  ↓
Trigger automático en DB
  ↓
Notificación para admin
  ↓
Campanita 🔔 muestra contador
  ↓
Admin ve: "Juan aceptó la promoción: Sandwiches de Pollo"
```

## Preguntas Frecuentes

### ¿Puedo cambiar la fecha de entrega después de crear la promo?
No, para mantener consistencia. Crea una nueva promo si necesitas cambiar.

### ¿Qué pasa si nadie acepta la promo?
No preparas nada. El contador mostrará "0 aceptaron".

### ¿Los usuarios ven promos pasadas?
No, solo ven la promo activa vigente (que todavía pueden aceptar).

### ¿Puedo tener varias promos a la vez para diferentes fechas?
Sí, cada fecha puede tener 1 promo activa. Puedes tener una para mañana, otra para el viernes, etc.

## Resumen Visual

```
HOY (Lunes 1)
└─ Admin crea promo para Lunes 8

Martes 2 - Domingo 7
└─ Usuarios VEN modal y pueden aceptar
   └─ "📅 Entrega: lunes 8"

Domingo 7 (23:59)
└─ 🔒 CIERRE automático

Lunes 8 (AM)
└─ Admin ve estadísticas
└─ Prepara cantidad exacta

Lunes 8 (PM)
└─ Admin entrega a quienes pidieron
```

---

**¡Sistema listo para usar!** 🎉

Ejecuta las migraciones y empieza a crear promociones.
