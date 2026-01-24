/**
 * Script de Seed Data para EmprendeJoven 360
 * Ejecutar con: npx tsx scripts/seed.ts
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import {
    phases,
    levels,
    modules,
    units,
    contents,
    evaluations,
    users
} from '../drizzle/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is required');
}

const client = postgres(connectionString, { ssl: 'require' });
const db = drizzle(client);

async function seed() {
    console.log('🌱 Starting seed process...\n');

    // Check if data already exists
    const existingPhases = await db.select().from(phases);
    if (existingPhases.length > 0) {
        console.log('⚠️  Data already exists. Skipping seed.');
        await client.end();
        return;
    }

    // =============================================
    // 1. SEED PHASES
    // =============================================
    console.log('📦 Seeding phases...');
    const insertedPhases = await db.insert(phases).values([
        {
            name: 'Preincubación',
            description: 'Fase exploratoria donde descubrirás tu vocación emprendedora, validarás ideas y construirás los fundamentos de tu proyecto.',
            order: 1
        },
        {
            name: 'Incubación',
            description: 'Fase de desarrollo intensivo donde escalarás tu emprendimiento, liderarás equipos y expandirás tu visión global.',
            order: 2
        }
    ]).returning();
    console.log(`  ✅ Created ${insertedPhases.length} phases`);

    const [preincubacion, incubacion] = insertedPhases;

    // =============================================
    // 2. SEED LEVELS
    // =============================================
    console.log('📦 Seeding levels...');
    const insertedLevels = await db.insert(levels).values([
        // Fase 1: Preincubación
        {
            phaseId: preincubacion.id,
            name: 'Explorador',
            description: 'Descubre tu vocación emprendedora. Aprenderás a identificar oportunidades y desarrollar mentalidad de emprendedor.',
            order: 1,
            requirements: { minAge: 16, prerequisites: [] }
        },
        {
            phaseId: preincubacion.id,
            name: 'Constructor',
            description: 'Construye los fundamentos de tu negocio. Crea propuestas de valor, modelos de negocio y prototipos.',
            order: 2,
            requirements: { completedLevel: 1, minScore: 70 }
        },
        {
            phaseId: preincubacion.id,
            name: 'Estratega',
            description: 'Desarrolla estrategias de negocio sólidas. Marketing, finanzas básicas y planificación estratégica.',
            order: 3,
            requirements: { completedLevel: 2, minScore: 75 }
        },
        // Fase 2: Incubación
        {
            phaseId: incubacion.id,
            name: 'Líder',
            description: 'Lidera equipos y gestiona proyectos. Habilidades de liderazgo y toma de decisiones.',
            order: 4,
            requirements: { completedPhase: 1, minScore: 80 }
        },
        {
            phaseId: incubacion.id,
            name: 'Visionario',
            description: 'Innova y escala globalmente. Innovación disruptiva, expansión de mercados y sostenibilidad.',
            order: 5,
            requirements: { completedLevel: 4, minScore: 85 }
        }
    ]).returning();
    console.log(`  ✅ Created ${insertedLevels.length} levels`);

    const [explorador, constructor, estratega, lider, visionario] = insertedLevels;

    // =============================================
    // 3. SEED MODULES (2 per level = 10 total)
    // =============================================
    console.log('📦 Seeding modules...');
    const insertedModules = await db.insert(modules).values([
        // Nivel 1: Explorador
        {
            levelId: explorador.id,
            name: 'Descubriendo tu Potencial',
            description: 'Identifica tus fortalezas, pasiones y el tipo de emprendedor que quieres ser.',
            order: 1,
            learningObjectives: ['Identificar fortalezas personales', 'Definir tu propósito emprendedor', 'Analizar casos de éxito'],
            estimatedHours: '4.5'
        },
        {
            levelId: explorador.id,
            name: 'Identificando Oportunidades',
            description: 'Aprende a detectar problemas que puedes resolver y convertirlos en oportunidades de negocio.',
            order: 2,
            learningObjectives: ['Técnicas de observación', 'Análisis de necesidades', 'Validación de ideas'],
            estimatedHours: '5.0'
        },
        // Nivel 2: Constructor
        {
            levelId: constructor.id,
            name: 'Modelo de Negocio Canvas',
            description: 'Diseña tu modelo de negocio usando la metodología Canvas y define tu propuesta de valor.',
            order: 3,
            learningObjectives: ['Crear Business Model Canvas', 'Definir propuesta de valor', 'Identificar segmentos de clientes'],
            estimatedHours: '6.0'
        },
        {
            levelId: constructor.id,
            name: 'Prototipado y MVP',
            description: 'Construye prototipos rápidos y un Producto Mínimo Viable para validar tu idea.',
            order: 4,
            learningObjectives: ['Técnicas de prototipado', 'Crear MVP', 'Recoger feedback de usuarios'],
            estimatedHours: '7.0'
        },
        // Nivel 3: Estratega
        {
            levelId: estratega.id,
            name: 'Marketing Digital Básico',
            description: 'Domina las herramientas esenciales de marketing digital para tu emprendimiento.',
            order: 5,
            learningObjectives: ['Redes sociales para negocios', 'Content marketing', 'Email marketing'],
            estimatedHours: '6.5'
        },
        {
            levelId: estratega.id,
            name: 'Finanzas para Emprendedores',
            description: 'Aprende a manejar las finanzas de tu negocio y a crear proyecciones financieras.',
            order: 6,
            learningObjectives: ['Flujo de caja', 'Punto de equilibrio', 'Proyecciones financieras'],
            estimatedHours: '5.5'
        },
        // Nivel 4: Líder
        {
            levelId: lider.id,
            name: 'Liderazgo y Equipos',
            description: 'Desarrolla habilidades de liderazgo para gestionar equipos de alto rendimiento.',
            order: 7,
            learningObjectives: ['Estilos de liderazgo', 'Motivación de equipos', 'Delegación efectiva'],
            estimatedHours: '6.0'
        },
        {
            levelId: lider.id,
            name: 'Gestión de Proyectos',
            description: 'Aprende metodologías ágiles y herramientas para gestionar proyectos eficientemente.',
            order: 8,
            learningObjectives: ['Metodología Scrum', 'Kanban para startups', 'OKRs y métricas'],
            estimatedHours: '7.0'
        },
        // Nivel 5: Visionario
        {
            levelId: visionario.id,
            name: 'Innovación Disruptiva',
            description: 'Crea productos y servicios que transformen industrias usando innovación disruptiva.',
            order: 9,
            learningObjectives: ['Pensamiento lateral', 'Blue Ocean Strategy', 'Tendencias tecnológicas'],
            estimatedHours: '8.0'
        },
        {
            levelId: visionario.id,
            name: 'Escalamiento Global',
            description: 'Expande tu negocio a nuevos mercados y prepárate para la inversión.',
            order: 10,
            learningObjectives: ['Estrategias de expansión', 'Pitch para inversores', 'Due diligence'],
            estimatedHours: '8.5'
        }
    ]).returning();
    console.log(`  ✅ Created ${insertedModules.length} modules`);

    // =============================================
    // 4. SEED UNITS (3 per module = 30 total)
    // =============================================
    console.log('📦 Seeding units...');

    const unitsData = [];
    const contentTypes = ['video', 'podcast', 'ebook', 'infografia', 'quiz'] as const;

    for (let i = 0; i < insertedModules.length; i++) {
        const mod = insertedModules[i];
        const unitNames = getUnitNamesForModule(i);

        for (let j = 0; j < 3; j++) {
            unitsData.push({
                moduleId: mod.id,
                name: unitNames[j].name,
                description: unitNames[j].description,
                order: j + 1,
                contentType: contentTypes[j % 5],
                contentUrl: `https://content.emprendejoven360.com/modules/${mod.id}/unit-${j + 1}`,
                duration: 15 + (j * 5),
                estimatedTime: 20 + (j * 10)
            });
        }
    }

    const insertedUnits = await db.insert(units).values(unitsData).returning();
    console.log(`  ✅ Created ${insertedUnits.length} units`);

    // =============================================
    // 5. SEED ADMIN USER
    // =============================================
    console.log('📦 Seeding admin user...');
    await db.insert(users).values({
        openId: 'admin-user',
        name: 'Administrador',
        email: 'admin@emprendejoven360.com',
        loginMethod: 'system',
        role: 'admin'
    });
    console.log('  ✅ Created admin user');

    console.log('\n🎉 Seed completed successfully!');
    await client.end();
}

function getUnitNamesForModule(moduleIndex: number): Array<{ name: string, description: string }> {
    const unitsByModule = [
        // Módulo 1: Descubriendo tu Potencial
        [
            { name: 'Autoconocimiento Emprendedor', description: 'Identifica tus fortalezas y áreas de mejora como emprendedor.' },
            { name: 'Historias de Éxito', description: 'Analiza casos de emprendedores exitosos y sus lecciones aprendidas.' },
            { name: 'Tu Propósito Emprendedor', description: 'Define tu misión personal y visión como futuro empresario.' }
        ],
        // Módulo 2: Identificando Oportunidades
        [
            { name: 'Observación del Entorno', description: 'Técnicas para identificar problemas y necesidades en tu comunidad.' },
            { name: 'Análisis de Tendencias', description: 'Cómo identificar tendencias de mercado y oportunidades emergentes.' },
            { name: 'Validación de Ideas', description: 'Métodos para validar si tu idea tiene potencial de mercado.' }
        ],
        // Módulo 3: Modelo de Negocio Canvas
        [
            { name: 'Los 9 Bloques del Canvas', description: 'Comprende cada componente del Business Model Canvas.' },
            { name: 'Propuesta de Valor', description: 'Crea una propuesta de valor irresistible para tus clientes.' },
            { name: 'Segmentos de Clientes', description: 'Identifica y define a tu cliente ideal.' }
        ],
        // Módulo 4: Prototipado y MVP
        [
            { name: 'Técnicas de Prototipado', description: 'Aprende métodos rápidos para crear prototipos de bajo costo.' },
            { name: 'Construyendo tu MVP', description: 'Desarrolla un producto mínimo viable en tiempo récord.' },
            { name: 'Iteración con Feedback', description: 'Mejora tu producto basándote en comentarios de usuarios.' }
        ],
        // Módulo 5: Marketing Digital Básico
        [
            { name: 'Redes Sociales para Negocios', description: 'Estrategias efectivas de marketing en redes sociales.' },
            { name: 'Content Marketing', description: 'Crea contenido que atraiga y convierta clientes.' },
            { name: 'Email Marketing', description: 'Construye y gestiona una lista de suscriptores efectiva.' }
        ],
        // Módulo 6: Finanzas para Emprendedores
        [
            { name: 'Flujo de Caja', description: 'Aprende a gestionar el dinero que entra y sale de tu negocio.' },
            { name: 'Punto de Equilibrio', description: 'Calcula cuánto debes vender para cubrir tus costos.' },
            { name: 'Proyecciones Financieras', description: 'Crea proyecciones realistas para tu emprendimiento.' }
        ],
        // Módulo 7: Liderazgo y Equipos
        [
            { name: 'Estilos de Liderazgo', description: 'Descubre y desarrolla tu estilo de liderazgo único.' },
            { name: 'Motivación de Equipos', description: 'Técnicas para mantener a tu equipo motivado y productivo.' },
            { name: 'Delegación Efectiva', description: 'Aprende a delegar tareas sin perder el control.' }
        ],
        // Módulo 8: Gestión de Proyectos
        [
            { name: 'Metodología Scrum', description: 'Implementa Scrum para gestionar proyectos de forma ágil.' },
            { name: 'Kanban para Startups', description: 'Usa tableros Kanban para visualizar y optimizar flujos de trabajo.' },
            { name: 'OKRs y Métricas', description: 'Define objetivos y resultados clave para medir el progreso.' }
        ],
        // Módulo 9: Innovación Disruptiva
        [
            { name: 'Pensamiento Lateral', description: 'Desarrolla creatividad para resolver problemas de forma innovadora.' },
            { name: 'Blue Ocean Strategy', description: 'Crea mercados nuevos donde no haya competencia.' },
            { name: 'Tendencias Tecnológicas', description: 'Identifica tecnologías emergentes para tu negocio.' }
        ],
        // Módulo 10: Escalamiento Global
        [
            { name: 'Estrategias de Expansión', description: 'Planifica la expansión de tu negocio a nuevos mercados.' },
            { name: 'Pitch para Inversores', description: 'Crea un pitch deck efectivo para atraer inversión.' },
            { name: 'Due Diligence', description: 'Prepárate para el proceso de evaluación de inversores.' }
        ]
    ];

    return unitsByModule[moduleIndex] || unitsByModule[0];
}

seed().catch(console.error);
