# EmprendeJoven 360 - Arquitectura y Diseño

## 1. Visión General

**EmprendeJoven 360** es una plataforma integral de capacitación para jóvenes emprendedores (16-30 años) que combina un LMS personalizado, motor de IA adaptativo y chatbot multirrol para crear un ecosistema de preincubación e incubación de emprendimientos rentables.

## 2. Estructura de Capacitación

### 2.1 Fases
- **Fase 1: Preincubación** - Exploración y validación de ideas
- **Fase 2: Incubación** - Desarrollo y escalamiento de emprendimientos

### 2.2 Niveles (5 total)
1. **Explorador** - Descubrimiento de vocación emprendedora
2. **Constructor** - Construcción de fundamentos empresariales
3. **Estratega** - Desarrollo de estrategias de negocio
4. **Líder** - Liderazgo y gestión de equipos
5. **Visionario** - Innovación y escalamiento global

### 2.3 Módulos (10 total - 2 por nivel)
Cada nivel contiene 2 módulos con 3 unidades cada uno = 30 unidades totales

### 2.4 Unidades (30 total - 3 por módulo)
Cada unidad es una cápsula de microaprendizaje con múltiples formatos

## 3. Arquitectura Técnica

### Stack
- **Frontend:** React 19 + Tailwind CSS 4 + TypeScript
- **Backend:** Express 4 + tRPC 11 + Node.js
- **Base de Datos:** MySQL/TiDB
- **IA:** LLM integrado (Manus API) + Whisper (transcripción)
- **Almacenamiento:** S3 (archivos, videos, podcasts)
- **Autenticación:** OAuth Manus + JWT

## 4. Roles de Usuario

- **Joven Emprendedor:** Acceso a diagnóstico, contenidos, evaluaciones, chatbot, progreso
- **Mentor:** Seguimiento de estudiantes, retroalimentación, orientación
- **Administrador:** Gestión completa de contenidos, usuarios, métricas

## 5. Diseño Visual

### Paleta de Colores
- **Primario:** #6366F1 (Índigo)
- **Secundario:** #10B981 (Esmeralda)
- **Acento:** #F59E0B (Ámbar)
- **Fondo:** #FFFFFF
- **Texto:** #1F2937

### Tipografía
- **Títulos:** Inter Bold
- **Cuerpo:** Inter Regular
- **Código:** Fira Code

## 6. Próximos Pasos

1. Implementar esquema de base de datos
2. Crear autenticación con roles
3. Desarrollar diagnóstico inicial
4. Construir LMS con contenidos
5. Integrar IA para rutas adaptativas
6. Implementar chatbot
7. Crear dashboards
