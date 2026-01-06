# ☕ Bar Deudas PWA

Aplicación web progresiva (PWA) para gestionar consumos y pagos en el bar de una oficina. Elimina el registro en papel y automatiza el cálculo de saldos.

## 🚀 Características

- ✅ **Autenticación segura** con Supabase Auth
- 👤 **Roles de usuario**: Usuario estándar y Administrador
- 📱 **PWA**: Instalable en dispositivos móviles
- 💰 **Gestión de consumos**: Registro y anulación lógica
- 💵 **Registro de pagos** (solo admin)
- 📊 **Cálculo automático de saldos**
- 🔒 **Row Level Security (RLS)** en base de datos
- 🎨 **UI responsive** con Tailwind CSS (mobile-first)
- ⚡ **Performance optimizada** con Vite

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Librería UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router DOM** - Navegación
- **vite-plugin-pwa** - Progressive Web App

### Backend
- **Supabase** - Backend serverless
- **PostgreSQL** - Base de datos
- **Supabase Auth** - Autenticación
- **Row Level Security** - Seguridad a nivel de BD

## 📋 Requisitos Previos

- Node.js 16+ y npm
- Cuenta de Supabase (gratis en [supabase.com](https://supabase.com))

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd proyecto-tiendita
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto copiando `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

> 💡 Obtén estas credenciales en el dashboard de Supabase: Settings > API

### 4. Configurar Base de Datos en Supabase

1. Ve al **SQL Editor** en tu proyecto de Supabase
2. Copia el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecuta el script completo

Esto creará:
- ✅ Tablas: `profiles`, `consumos`, `pagos`
- ✅ Vista: `saldos_usuarios`
- ✅ Función: `is_admin()`
- ✅ Trigger: `create_profile_on_signup`
- ✅ Políticas RLS completas

### 5. Configurar Autenticación en Supabase

1. Ve a **Authentication > Providers**
2. Habilita **Email** provider
3. (Opcional) Deshabilita "Confirm email" para testing rápido

### 6. Crear primer usuario admin

Después de ejecutar la app y crear tu primer usuario, conviértelo en admin:

1. Ve a **SQL Editor** en Supabase
2. Ejecuta:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'tu-user-id-aqui';
```

> 💡 Encuentra el `user_id` en la tabla `profiles` o en Authentication > Users

## 🚀 Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`

## 🏗️ Estructura del Proyecto

```
bar-deudas-pwa/
├── public/
│   ├── icons/              # Iconos PWA
│   └── manifest.json       # Web App Manifest (auto-generado)
├── src/
│   ├── components/
│   │   ├── auth/           # LoginForm, RegisterForm
│   │   ├── consumos/       # ConsumoForm, ConsumoList, ConsumoItem
│   │   ├── pagos/          # PagoForm, PagoList
│   │   ├── saldos/         # MiSaldo, SaldosGlobales
│   │   ├── layout/         # Layout, Navbar, ProtectedRoute
│   │   └── ui/             # Button, Input, Card, Loading
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Home.jsx
│   │   ├── MisConsumos.jsx
│   │   ├── MiSaldoPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── NotFound.jsx
│   ├── context/
│   │   └── AuthContext.jsx    # Contexto de autenticación
│   ├── hooks/
│   │   ├── useAuth.jsx        # Hook de auth
│   │   ├── useConsumos.jsx    # Hook de consumos
│   │   ├── usePagos.jsx       # Hook de pagos
│   │   └── useSaldos.jsx      # Hook de saldos
│   ├── lib/
│   │   └── supabase.js        # Cliente Supabase
│   ├── utils/
│   │   ├── constants.js       # Constantes (roles, productos)
│   │   └── formatters.js      # Formateo (moneda, fechas)
│   ├── App.jsx                # Routing principal
│   ├── main.jsx               # Entry point
│   └── index.css              # Estilos globales
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Schema + RLS
├── .env.example               # Ejemplo de variables de entorno
├── vite.config.js             # Configuración Vite + PWA
├── tailwind.config.js         # Configuración Tailwind
└── package.json
```

## 👥 Roles y Permisos

### Usuario Estándar
- ✅ Registrar sus propios consumos
- ✅ Ver su historial de consumos
- ✅ Anular sus propios consumos
- ✅ Ver su saldo actual
- ✅ Ver su historial de pagos
- ❌ No puede registrar pagos
- ❌ No puede ver datos de otros usuarios

### Administrador
- ✅ Todo lo que puede hacer un usuario
- ✅ Ver saldos de todos los usuarios
- ✅ Ver consumos de todos los usuarios
- ✅ Ver pagos de todos los usuarios
- ✅ Registrar consumos para cualquier usuario
- ✅ Registrar pagos para cualquier usuario
- ✅ Anular consumos de cualquier usuario

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

- **profiles**: Los usuarios solo ven su propio perfil. Admin ve todos.
- **consumos**: Los usuarios solo ven sus consumos. Admin ve todos. Solo el dueño o admin puede anular.
- **pagos**: Los usuarios solo ven sus pagos. Admin ve todos. Solo admin puede crear pagos.
- **saldos_usuarios**: Los usuarios solo ven su saldo. Admin ve todos.

### Función `is_admin()`

Verifica si el usuario actual tiene role='admin'. Se usa en todas las políticas RLS para validar permisos a nivel de base de datos.

### Anulación Lógica

Los consumos nunca se borran físicamente. Se marcan como `anulado=true` con timestamp `anulado_at`. Esto mantiene el historial completo para auditoría.

## 💡 Flujo de Uso

### Usuario Estándar

1. **Login** → Se autentica
2. **Registrar Consumo** → Selecciona producto, cantidad y precio
3. **Ver Mi Saldo** → Consulta cuánto debe o tiene a favor
4. **Anular Consumo** → Si se equivocó, puede anular (no borrar)

### Administrador

1. **Login** → Se autentica
2. **Dashboard Admin** → Tiene 5 tabs:
   - **Saldos Globales**: Tabla con todos los usuarios y sus saldos
   - **Todos los Consumos**: Lista filtrable de consumos
   - **Todos los Pagos**: Lista filtrable de pagos
   - **Registrar Consumo**: Para cualquier usuario
   - **Registrar Pago**: Para cualquier usuario

## 📱 PWA - Instalación

### En Móvil (iOS/Android)

1. Abre la app en el navegador
2. Busca el botón "Agregar a pantalla de inicio" o "Install"
3. La app se instalará como una app nativa

### En Desktop (Chrome/Edge)

1. Abre la app en el navegador
2. Verás un ícono de instalación en la barra de direcciones
3. Haz clic en "Instalar"

## 🎨 UI/UX

### Mobile-First

- Diseñado primero para móviles
- Botones grandes (min 44x44px) para touch
- Espaciado generoso
- Tipografía legible (min 16px)

### Paleta de Colores

- **Primary (Azul)**: Acciones principales
- **Success (Verde)**: Saldos positivos, pagos
- **Danger (Rojo)**: Saldos negativos, anular
- **Gray**: Fondos, bordes, texto secundario

## 🧪 Testing Manual

### Probar como Usuario

1. Registrarse
2. Login
3. Crear consumo
4. Ver saldo (debe estar en negativo)
5. Anular consumo
6. Ver que el saldo se actualizó

### Probar como Admin

1. Convertir usuario a admin (ver sección "Crear primer usuario admin")
2. Login
3. Registrar pago para un usuario
4. Ver saldos globales
5. Filtrar consumos por usuario
6. Registrar consumo para otro usuario

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repo de GitHub a Vercel
2. Configura las variables de entorno en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático en cada push a main

### Netlify

Similar a Vercel, configurando las mismas variables de entorno.

## 🐛 Troubleshooting

### Error: "Supabase client not initialized"

- Verifica que las variables de entorno estén correctas en `.env`
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo

### Error: "Permission denied" al consultar datos

- Verifica que las políticas RLS estén creadas correctamente
- Ejecuta el script SQL completo en Supabase
- Verifica que el usuario esté autenticado

### Los consumos no se ven en el listado

- Verifica que el usuario sea el dueño del consumo
- Si eres admin, verifica que tengas role='admin' en la tabla profiles

### PWA no se instala

- Verifica que estés usando HTTPS (o localhost)
- Verifica que el manifest.json esté correctamente configurado
- Verifica que los iconos estén en la carpeta public/icons/

## 📚 Documentación Adicional

- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## ✨ Características Futuras (Roadmap)

- [ ] Notificaciones push cuando el saldo es negativo
- [ ] Exportar reportes a Excel/PDF
- [ ] Gráficos de consumo por período
- [ ] Categorías de productos personalizables
- [ ] Modo oscuro
- [ ] Multi-idioma (i18n)
- [ ] Integración con métodos de pago (Stripe, PayPal)

## 💬 Soporte

Si tienes preguntas o necesitas ayuda, abre un issue en GitHub.

---

Hecho con ❤️ y ☕ para simplificar la gestión del bar de oficina.
