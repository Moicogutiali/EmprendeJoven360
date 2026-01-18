import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Play, Headphones, FileText, Image, CheckCircle, Lock } from "lucide-react";
import { useState } from "react";

const LEVELS = [
  { id: 1, name: "Explorador", phase: "Preincubacion", color: "bg-blue-500" },
  { id: 2, name: "Constructor", phase: "Preincubacion", color: "bg-indigo-500" },
  { id: 3, name: "Estratega", phase: "Incubacion", color: "bg-purple-500" },
  { id: 4, name: "Lider", phase: "Incubacion", color: "bg-pink-500" },
  { id: 5, name: "Visionario", phase: "Incubacion", color: "bg-rose-500" },
];

const MODULES_DATA = {
  1: [
    { id: 1, name: "Descubrimiento de Vocacion", description: "Identifica tu pasion y proposito emprendedor" },
    { id: 2, name: "Fundamentos de Negocios", description: "Conceptos basicos de emprendimiento" },
  ],
  2: [
    { id: 3, name: "Validacion de Ideas", description: "Aprende a validar tu idea de negocio" },
    { id: 4, name: "Modelo de Negocios", description: "Crea tu modelo de negocio efectivo" },
  ],
  3: [
    { id: 5, name: "Estrategia de Mercado", description: "Desarrolla tu estrategia competitiva" },
    { id: 6, name: "Finanzas para Emprendedores", description: "Gestiona tus finanzas correctamente" },
  ],
  4: [
    { id: 7, name: "Liderazgo y Equipo", description: "Lidera y construye tu equipo" },
    { id: 8, name: "Gestion Operacional", description: "Optimiza tus operaciones" },
  ],
  5: [
    { id: 9, name: "Escalamiento Global", description: "Expande tu negocio globalmente" },
    { id: 10, name: "Innovacion Continua", description: "Innova y mantente competitivo" },
  ],
};

const UNITS_DATA = {
  1: [
    { id: 1, name: "Quien soy como emprendedor?", type: "video", duration: 15 },
    { id: 2, name: "Mi proposito empresarial", type: "podcast", duration: 20 },
    { id: 3, name: "Pasiones y habilidades", type: "ebook", duration: 30 },
  ],
  2: [
    { id: 4, name: "Que es un emprendimiento?", type: "video", duration: 12 },
    { id: 5, name: "Tipos de negocios", type: "infografia", duration: 10 },
    { id: 6, name: "Primeros pasos", type: "quiz", duration: 15 },
  ],
};

const getContentIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Play className="w-4 h-4" />;
    case "podcast":
      return <Headphones className="w-4 h-4" />;
    case "ebook":
      return <FileText className="w-4 h-4" />;
    case "infografia":
      return <Image className="w-4 h-4" />;
    case "quiz":
      return <BookOpen className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

export default function Learning() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedModule, setSelectedModule] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);

  const { data: phases, isLoading: phasesLoading } = trpc.learning.getPhases.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (phasesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-foreground/60">Cargando modulos...</p>
        </div>
      </div>
    );
  }

  const modules = MODULES_DATA[selectedLevel as keyof typeof MODULES_DATA] || [];
  const units = UNITS_DATA[selectedModule as keyof typeof UNITS_DATA] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-secondary/5">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container h-16 flex items-center justify-between">
          <h1 className="font-bold text-lg text-foreground">Modulos de Aprendizaje</h1>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Volver
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Niveles */}
          <div className="lg:col-span-1">
            <Card className="p-4 border-border/40 sticky top-20">
              <h3 className="font-semibold text-foreground mb-4">Niveles</h3>
              <div className="space-y-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => {
                      setSelectedLevel(level.id);
                      setSelectedModule(MODULES_DATA[level.id as keyof typeof MODULES_DATA][0]?.id || 1);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedLevel === level.id
                        ? "bg-primary/20 border border-primary/40 text-primary font-semibold"
                        : "hover:bg-muted text-foreground/70"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${level.color}`}></div>
                      <span className="text-sm">{level.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Modulos */}
            <Card className="p-6 border-border/40">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {LEVELS.find(l => l.id === selectedLevel)?.name} - Modulos
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedModule === module.id
                        ? "border-primary bg-primary/5"
                        : "border-border/40 hover:border-primary/40"
                    }`}
                  >
                    <h4 className="font-semibold text-foreground mb-1">{module.name}</h4>
                    <p className="text-sm text-foreground/60">{module.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">3 unidades</Badge>
                      <Badge variant="secondary" className="text-xs">Completado: 0%</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Unidades */}
            <Card className="p-6 border-border/40">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {modules.find(m => m.id === selectedModule)?.name} - Unidades
              </h2>
              <div className="space-y-3">
                {units.map((unit, index) => (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit.id)}
                    className="w-full p-4 rounded-lg border border-border/40 hover:bg-primary/5 transition-colors text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            {getContentIcon(unit.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{unit.name}</h4>
                            <p className="text-xs text-foreground/60 capitalize">{unit.type} - {unit.duration} min</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {index === 0 ? (
                          <Badge className="bg-secondary">En Progreso</Badge>
                        ) : index === 1 ? (
                          <CheckCircle className="w-5 h-5 text-secondary" />
                        ) : (
                          <Lock className="w-5 h-5 text-foreground/40" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Detalles de Unidad */}
            {selectedUnit && (
              <Card className="p-6 border-border/40 bg-gradient-to-br from-primary/5 to-secondary/5">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {units.find(u => u.id === selectedUnit)?.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Tipo de Contenido</p>
                    <Badge className="capitalize">
                      {units.find(u => u.id === selectedUnit)?.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Duracion Estimada</p>
                    <p className="text-foreground font-semibold">
                      {units.find(u => u.id === selectedUnit)?.duration} minutos
                    </p>
                  </div>
                  <Button className="w-full mt-4">
                    Comenzar Unidad
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
