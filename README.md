# EmprendeJoven 360 🚀

Plataforma integral de capacitación para jóvenes emprendedores (16-30 años) que combina un LMS personalizado, motor de IA adaptativo y chatbot multirrol.

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Vite 7 + Tailwind CSS 4 + TypeScript
- **Backend:** Express 4 + tRPC 11 + Node.js
- **Base de Datos:** PostgreSQL (Supabase)
- **ORM:** Drizzle ORM
- **Autenticación:** JWT + OAuth
- **Despliegue:** Vercel

## 📋 Requisitos Previos

- Node.js >= 18
- pnpm >= 9
- Cuenta de Supabase (para base de datos)
- Cuenta de Vercel (para despliegue)

## 🚀 Instalación Local

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd EmprendeJoven360
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres
VITE_SUPABASE_URL=https://XXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your-secure-secret
```

### 4. Ejecutar migraciones de base de datos

```bash
pnpm db:push
```

### 5. Poblar base de datos (seed data)

```bash
pnpm db:seed
```

### 6. Iniciar servidor de desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📦 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia el servidor de desarrollo |
| `pnpm build` | Construye la aplicación para producción |
| `pnpm start` | Inicia el servidor en producción |
| `pnpm check` | Verifica tipos TypeScript |
| `pnpm format` | Formatea código con Prettier |
| `pnpm test` | Ejecuta tests |
| `pnpm db:push` | Ejecuta migraciones de Drizzle |
| `pnpm db:seed` | Puebla la base de datos |

## 🌐 Despliegue en Vercel

### 1. Conectar repositorio

1. Ve a [vercel.com](https://vercel.com)
2. Importa el repositorio desde GitHub/GitLab
3. Selecciona el proyecto `EmprendeJoven360`

### 2. Configurar variables de entorno

En el dashboard de Vercel, agrega estas variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Tu URL de PostgreSQL de Supabase |
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `JWT_SECRET` | Clave secreta para JWT (mínimo 32 caracteres) |
| `VITE_APP_ID` | `emprendejoven-360` |
| `OWNER_OPEN_ID` | `admin-user` |

### 3. Configurar Build Settings

- **Framework Preset:** Other
- **Build Command:** `pnpm run build`
- **Install Command:** `pnpm install`
- **Output Directory:** `dist/public`

### 4. Desplegar

```bash
vercel --prod
```

## 📊 Estructura de la Base de Datos

| Tabla | Descripción | Registros |
|-------|-------------|-----------|
| `users` | Usuarios del sistema | Roles: emprendedor, mentor, admin |
| `phases` | Fases de capacitación | 2 (Preincubación, Incubación) |
| `levels` | Niveles de aprendizaje | 5 (Explorador → Visionario) |
| `modules` | Módulos por nivel | 10 (2 por nivel) |
| `units` | Unidades por módulo | 30 (3 por módulo) |
| `contents` | Contenidos multimedia | Videos, podcasts, eBooks |
| `evaluations` | Evaluaciones | Quiz por unidad |
| `user_progress` | Progreso del usuario | Por unidad |
| `gamification` | Sistema de puntos | Puntos, badges, racha |

## 🔒 Seguridad

- ✅ RLS (Row Level Security) habilitado en todas las tablas
- ✅ Autenticación JWT con cookies HttpOnly
- ✅ Validación de roles (emprendedor, mentor, admin)
- ✅ Protección de rutas tRPC

## 🎯 Funcionalidades del MVP

- [x] Landing page atractiva
- [x] Autenticación con roles
- [x] Dashboard de usuario
- [x] Diagnóstico inicial
- [x] Visualización de cursos (LMS)
- [x] Sistema de progreso
- [x] Panel de administración básico
- [x] Internacionalización (ES/EN)
- [ ] Chatbot con IA
- [ ] Evaluaciones interactivas
- [ ] Sistema de gamificación completo

## 📁 Estructura del Proyecto

```
EmprendeJoven360/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── pages/          # Páginas de la app
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilidades
│   │   └── contexts/       # Contextos React
│   └── public/             # Assets estáticos
├── _server/                # Backend Express
│   ├── _core/              # Core del servidor
│   ├── routers.ts          # Rutas tRPC
│   └── db.ts               # Helpers de DB
├── drizzle/                # Esquema y migraciones
│   ├── schema.ts           # Esquema de tablas
│   └── migrations/         # Migraciones SQL
├── shared/                 # Código compartido
├── scripts/                # Scripts de utilidad
│   └── seed.ts             # Seed data
├── api/                    # Serverless function (Vercel)
├── vercel.json             # Config de Vercel
└── package.json
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

Desarrollado con ❤️ para jóvenes emprendedores latinoamericanos.
