# EmprendeJoven 360 - Project TODO

## Fase 1: Arquitectura y Base de Datos
- [x] Diseñar esquema completo de base de datos
- [x] Crear tablas: users, phases, levels, modules, units, content, evaluations, user_progress, gamification, adaptive_routes, chatbot_interactions
- [x] Implementar migraciones de Drizzle ORM
- [x] Crear helpers de base de datos en server/db.ts

## Fase 2: Autenticación y Roles
- [x] Implementar autenticación OAuth con 3 roles (emprendedor, mentor, admin)
- [x] Crear procedimientos tRPC para auth (login, logout, getCurrentUser)
- [x] Implementar protectedProcedure y adminProcedure
- [x] Crear página de inicio elegante
- [x] Implementar sistema de roles en frontend

## Fase 3: Diagnóstico Inicial
- [x] Diseñar cuestionario adaptativo (5 preguntas iniciales)
- [x] Crear componente interactivo de diagnóstico
- [x] Implementar procedimiento tRPC para procesar diagnóstico
- [ ] Integrar LLM para análisis de respuestas
- [ ] Generar ruta personalizada basada en resultados
- [ ] Crear página de resultados del diagnóstico

## Fase 4: LMS y Estructura Modular
- [x] Crear componente de navegación de módulos
- [x] Implementar visualización de niveles (5 niveles)
- [x] Implementar visualización de módulos (10 módulos)
- [x] Implementar visualización de unidades (30 unidades)
- [ ] Crear reproductor de contenido para videos
- [ ] Crear reproductor de podcasts
- [ ] Crear visor de eBooks
- [ ] Crear visor de infografías
- [ ] Implementar sistema de progreso por unidad

## Fase 5: Evaluaciones Interactivas
- [ ] Crear sistema de cuestionarios interactivos
- [ ] Implementar retroalimentación automática
- [ ] Crear sistema de puntuación
- [ ] Implementar criterios de aprobación
- [ ] Crear visualización de resultados de evaluación
- [ ] Integrar análisis de respuestas con IA

## Fase 6: Gamificación
- [x] Implementar sistema de puntos (estructura base)
- [x] Crear sistema de insignias/badges (estructura base)
- [x] Implementar niveles de progreso (estructura base)
- [x] Crear racha de días consecutivos (estructura base)
- [ ] Crear tabla de posiciones
- [x] Implementar visualización de logros
- [ ] Crear notificaciones de hitos alcanzados

## Fase 7: Motor de IA y Rutas Adaptativas
- [ ] Crear procedimiento para generar rutas adaptativas
- [ ] Implementar análisis de desempeño
- [ ] Crear recomendaciones de contenido
- [ ] Implementar ajuste dinámico de dificultad
- [ ] Crear procedimiento para identificar brechas de conocimiento
- [ ] Integrar LLM para análisis avanzado

## Fase 8: Chatbot Multirrol
- [ ] Crear componente de chat
- [ ] Implementar rol Mentor (explicación de conceptos)
- [ ] Implementar rol Asesor (orientación empresarial)
- [ ] Implementar rol Motivador (motivación y celebración)
- [ ] Integrar LLM para respuestas contextuales
- [ ] Crear historial de conversaciones
- [ ] Implementar sistema de contexto personalizado

## Fase 9: Dashboard de Progreso
- [x] Crear dashboard principal del usuario
- [x] Implementar visualización de progreso general
- [x] Crear gráficos de avance por nivel
- [x] Implementar visualización de logros desbloqueados
- [x] Crear recomendaciones de próximos pasos
- [x] Implementar estadísticas personales
- [x] Crear visualización de racha y puntos

## Fase 10: Panel Administrativo
- [ ] Crear layout de administrador
- [ ] Implementar gestión de usuarios (CRUD)
- [ ] Crear gestión de contenidos
- [ ] Implementar gestión de módulos y unidades
- [ ] Crear gestión de evaluaciones
- [ ] Implementar seguimiento de usuarios
- [ ] Crear análisis de métricas
- [ ] Implementar reportes de desempeño
- [ ] Crear gestión de mentores y asignaciones

## Fase 11: Integración y Optimización
- [ ] Integrar todos los componentes
- [ ] Realizar pruebas de funcionalidad
- [ ] Optimizar rendimiento
- [ ] Mejorar experiencia de usuario
- [ ] Realizar pruebas de seguridad
- [ ] Implementar validaciones
- [ ] Crear documentación de usuario

## Fase 12: Contenido de Ejemplo
- [ ] Crear contenido de ejemplo para todos los niveles
- [ ] Crear evaluaciones de ejemplo
- [ ] Crear módulos de ejemplo completos
- [ ] Poblar base de datos con datos iniciales

## Testing
- [x] Crear tests unitarios para lógica de negocio
- [x] Tests de gamificación (cálculo de niveles, puntos, racha)
- [x] Tests de diagnóstico (determinación de nivel, validación)
- [x] Tests de ruta de aprendizaje (estructura, progreso, desbloqueo)
- [x] Tests de evaluación (cálculo de puntuación, aprobación, retroalimentación)
- [x] Tests de gestión de contenido (validación de tipos)
- [x] Tests de roles de usuario (validación, permisos)
- [x] Tests de chatbot (validación de roles, formato de respuestas)
- [ ] Tests de integración con base de datos
- [ ] Tests de API tRPC

## Bugs y Mejoras
- Migración de base de datos: Necesita configuración de multi-statement en TiDB
- Contenido de ejemplo: Aún no se ha poblado la base de datos con datos iniciales
- Integración de LLM: Pendiente para análisis avanzado de diagnóstico y chatbot

## Bugs Críticos
- [x] OAuth callback failed - Error en autenticación OAuth (RESUELTO: Se removieron campos no existentes en tabla users)
- [x] Revisar configuración de variables de entorno OAuth
- [x] Verificar endpoint de callback OAuth

## Bugs Críticos - Registro
- [x] Error 403 en flujo de registro - RESUELTO: Se removieron columnas no existentes de la tabla users
- [x] Verificar configuración de VITE_OAUTH_PORTAL_URL
- [x] Validar endpoint de callback OAuth

## Bugs Críticos - Diagnóstico
- [x] Error al guardar respuestas del diagnóstico - RESUELTO: Creadas todas las tablas necesarias en BD
- [x] Verificar estructura de tabla en BD vs esquema Drizzle
