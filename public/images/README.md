# 📁 Carpeta de Imágenes

Esta carpeta contiene las imágenes públicas de la aplicación.

## 🎨 Cómo usar:

### 1. Agregar tu imagen de mascota:
   - Coloca tu imagen aquí con el nombre: **`mascota.png`** (o `.jpg`, `.gif`, etc.)
   - Tamaño recomendado: 512x512 px o similar (para que se vea bien grande en el modal)
   - Formato: PNG con fondo transparente (recomendado)

### 2. La imagen se mostrará:
   - ✅ **En un modal emergente centrado** al registrar un consumo exitosamente
   - ✅ Con animación de rebote
   - ✅ Se cierra automáticamente después de 3 segundos
   - ✅ Si no existe la imagen, muestra un emoji de celebración 🎉

### 3. Usar otras imágenes:
   Para agregar más imágenes, simplemente:
   ```jsx
   <img src="/images/nombre-de-tu-imagen.png" alt="Descripción" />
   ```

## 📋 Nombres de archivos sugeridos:
- `mascota.png` - Mascota principal para modal de éxito (ya está configurado)
- `logo.png` - Logo de la app
- `favicon.ico` - Ícono del navegador
- `error.png` - Para mensajes de error
- etc.

## ⚠️ Importante:
- Los archivos en `public/` se sirven directamente
- No necesitas importarlos en el código
- Usa rutas que empiecen con `/images/...`
- La imagen aparecerá con animación en un modal bonito y llamativo ✨
