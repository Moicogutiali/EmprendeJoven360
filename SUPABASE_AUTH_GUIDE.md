# Supabase Auth Implementation Guide

## ✅ Implementación Completada

Se ha implementado completamente **Supabase Auth** en EmprendeJoven 360. A continuación, los detalles de la implementación:

---

## 📦 Nuevos Archivos Creados

### 1. **Cliente de Supabase** (`client/src/lib/supabase.ts`)
- Configuración del cliente Supabase con PKCE flow
- Tipos TypeScript para la base de datos
- Auto-refresh de tokens habilitado

### 2. **Hook de Autenticación** (`client/src/hooks/useSupabaseAuth.ts`)
- Hook React personalizado para Supabase Auth
- Métodos: `signUp`, `signIn`, `signInWithOAuth`, `signOut`, `resetPassword`, `updatePassword`
- Manejo automático de sesiones y auth state

### 3. **Página de Autenticación** (`client/src/pages/Auth.tsx`)
- UI completa con tabs para Login y Registro
- Soporte para autenticación con email/password
- Botones OAuth para Google y GitHub
- Validación de formularios y manejo de errores

### 4. **Callback de OAuth** (`client/src/pages/AuthCallback.tsx`)
- Maneja la redirección después de OAuth
- Sincroniza usuarios con la tabla `users` en la base de datos
- Redirección automática al dashboard

---

## 🔧 Archivos Actualizados

### 1. **App.tsx**
- Agregadas rutas `/auth` y `/auth/callback`

### 2. **useAuth.ts** (Hook principal)
- Integración con Supabase Auth como fuente principal
- Mantiene compatibilidad con tRPC para datos adicionales
- Expone métodos de Supabase: `signUp`, `signIn`, `signInWithOAuth`

### 3. **const.ts**
- `getLoginUrl()` ahora apunta a `/auth` en lugar del antiguo OAuth externo

### 4. **RLS Policies** (Base de datos)
- Políticas mejoradas usando `auth.uid()` de Supabase
- Restricciones basadas en el usuario autenticado
- Contenido público sigue siendo visible para todos

---

## ⚙️ Configuración Requerida en Supabase

### 1. **Habilitar Providers de OAuth**

En el dashboard de Supabase (https://supabase.com/dashboard):

1. Ve a **Authentication** → **Providers**
2. Habilita los providers deseados:
   - ✅ **Email** (ya habilitado por defecto)
   - ✅ **Google** (requiere Google Cloud OAuth credentials)
   - ✅ **GitHub** (requiere GitHub OAuth App)

#### Configurar Google OAuth:
```
1. Ve a Google Cloud Console
2. Crea un proyecto o usa uno existente
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega Authorized redirect URIs:
   https://vsbsandlnekmtywtqzmr.supabase.co/auth/v1/callback
6. Copia Client ID y Client Secret a Supabase
```

#### Configurar GitHub OAuth:
```
1. Ve a GitHub Settings → Developer settings → OAuth Apps
2. Crea una nueva OAuth App
3. Homepage URL: https://tu-dominio.com
4. Authorization callback URL:
   https://vsbsandlnekmtywtqzmr.supabase.co/auth/v1/callback
5. Copia Client ID y Client Secret a Supabase
```

### 2. **Configurar Email Templates**

En **Authentication** → **Email Templates**, personaliza:
- Confirmation email (registro)
- Magic Link email
- Reset Password email
- Change Email email

### 3. **Site URL Configuration**

En **Authentication** → **URL Configuration**:
- **Site URL**: `https://tu-dominio-vercel.app` (o localhost:3000 para desarrollo)
- **Redirect URLs**: Agrega las URLs permitidas:
  ```
  http://localhost:3000/**
  https://tu-dominio-vercel.app/**
  ```

---

## 🔐 Seguridad RLS Mejorada

Las nuevas políticas RLS usan `auth.uid()` para verificar la identidad:

```sql
-- Ejemplo: Usuario puede ver solo su progreso
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = user_progress."userId" AND users."openId" = auth.uid()::text)
  );
```

**Tablas protegidas por RLS con auth.uid():**
- `users`
- `evaluation_answers`
- `user_progress`
- `gamification`
- `initial_diagnostics`
- `adaptive_routes`
- `chatbot_interactions`

**Tablas con lectura pública:**
- `phases`, `levels`, `modules`, `units`, `contents`, `evaluations` (contenido LMS)

---

## 🚀 Uso en el Código

### Registro de usuario:
```typescript
const { signUp } = useAuth();

await signUp('user@example.com', 'password123', {
  name: 'Juan Pérez'
});
```

### Login:
```typescript
const { signIn } = useAuth();

await signIn('user@example.com', 'password123');
```

### Login con OAuth:
```typescript
const { signInWithOAuth } = useAuth();

await signInWithOAuth('google'); // o 'github'
```

### Logout:
```typescript
const { logout } = useAuth();

await logout();
```

### Verificar autenticación:
```typescript
const { isAuthenticated, user, loading } = useAuth();

if (isAuthenticated) {
  console.log('Usuario:', user.name, user.email, user.role);
}
```

---

## 🧪 Testing Local

1. **Iniciar servidor de desarrollo**:
   ```bash
   pnpm dev
   ```

2. **Navegar a**:
   ```
   http://localhost:3000/auth
   ```

3. **Probar flujos**:
   - ✅ Registro con email/password
   - ✅ Login con email/password
   - ✅ Logout
   - ⚠️ OAuth (requiere configuración de providers)

---

## 📋 Variables de Entorno Requeridas

Asegúrate de tener estas variables configuradas:

```env
# Supabase
VITE_SUPABASE_URL=https://vsbsandlnekmtywtqzmr.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key

# Database
DATABASE_URL=postgresql://...

# JWT (mantener para compatibilidad con tRPC)
JWT_SECRET=tu_secret
```

---

## 🎯 Próximos Pasos

1. **Configurar OAuth Providers** en Supabase Dashboard
2. **Personalizar Email Templates** con branding de EmprendeJoven 360
3. **Probar flujos de autenticación** en desarrollo
4. **Configurar Site URL** para Vercel en producción
5. **Opcional**: Agregar autenticación de dos factores (2FA)

---

## 🔄 Migración desde el Antiguo Sistema

El nuevo sistema es **compatible hacia atrás**:
- Las rutas antiguas (`/api/oauth/bypass`) siguen funcionando
- Los usuarios existentes en la BD pueden migrar gradualmente
- El hook `useAuth` unifica ambos sistemas

Para migrar completamente:
1. Los usuarios nuevos usarán Supabase Auth automáticamente
2. Los usuarios antiguos pueden re-autenticarse con la nueva UI
3. Una vez todos migrados, puedes eliminar el código OAuth antiguo

---

## ✅ Checklist de Implementación

- [x] Cliente Supabase configurado
- [x] Hook useSupabaseAuth creado
- [x] Página de Auth con UI completa
- [x] Callback de OAuth implementado
- [x] Routes agregadas a App.tsx
- [x] useAuth integrado con Supabase
- [x] RLS policies mejoradas con auth.uid()
- [ ] OAuth providers configurados en Supabase
- [ ] Email templates personalizados
- [ ] Site URL configurado para producción
- [ ] Testing completo de todos los flujos

---

¡La implementación de Supabase Auth está completa y lista para usar! 🎉
