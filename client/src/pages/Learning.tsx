import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Play, Headphones, FileText, Image, CheckCircle, Lock } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  // 1. Fetch Structure (Phases + Levels) for Sidebar
  const { data: structure, isLoading: structureLoading } = trpc.learning.getStructure.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // 2. Fetch Modules when Level is selected
  const { data: modules, isLoading: modulesLoading } = trpc.learning.getModulesByLevel.useQuery(
    { levelId: selectedLevelId! },
    { enabled: !!selectedLevelId }
  );

  // 3. Fetch Units when Module is selected
  const { data: units, isLoading: unitsLoading } = trpc.learning.getUnitsByModule.useQuery(
    { moduleId: selectedModuleId! },
    { enabled: !!selectedModuleId }
  );

  // Auto-select first level and module on load
  useEffect(() => {
    if (structure && structure.length > 0 && !selectedLevelId) {
      // Find first phase with levels
      const firstPhaseWithLevels = structure.find(p => p.levels.length > 0);
      if (firstPhaseWithLevels && firstPhaseWithLevels.levels.length > 0) {
        setSelectedLevelId(firstPhaseWithLevels.levels[0].id);
      }
    }
  }, [structure, selectedLevelId]);

  useEffect(() => {
    if (modules && modules.length > 0 && (!selectedModuleId || !modules.find(m => m.id === selectedModuleId))) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModuleId]);


  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (structureLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-foreground/60">Cargando estructura de aprendizaje...</p>
        </div>
      </div>
    );
  }

  // Helper to find current objects for display
  const currentLevelName = structure?.flatMap(p => p.levels).find(l => l.id === selectedLevelId)?.name;
  const currentModule = modules?.find(m => m.id === selectedModuleId);
  const currentUnit = units?.find(u => u.id === selectedUnitId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-secondary/5">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container h-16 flex items-center justify-between">
          <h1 className="font-bold text-lg text-foreground">Módulos de Aprendizaje</h1>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Volver
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Niveles grouped by Phase */}
          <div className="lg:col-span-1">
            <Card className="p-4 border-border/40 sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-semibold text-foreground mb-4">Tu Ruta</h3>
              <div className="space-y-6">
                {structure?.map((phase) => (
                  <div key={phase.id}>
                    <h4 className="text-xs uppercase text-muted-foreground font-bold mb-2 ml-2">{phase.name}</h4>
                    <div className="space-y-1">
                      {phase.levels.map(level => (
                        <button
                          key={level.id}
                          onClick={() => {
                            setSelectedLevelId(level.id);
                            setSelectedModuleId(null); // Reset module on level change
                          }}
                          className={`w-full text-left p-2 rounded-lg transition-colors text-sm ${selectedLevelId === level.id
                              ? "bg-primary/20 text-primary font-semibold"
                              : "hover:bg-muted text-foreground/70"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${selectedLevelId === level.id ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                            <span>{level.name}</span>
                          </div>
                        </button>
                      ))}
                      {phase.levels.length === 0 && <p className="text-xs text-muted-foreground ml-4 italic">Próximamente</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Modulos */}
            <Card className="p-6 border-border/40">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {currentLevelName || "Selecciona un Nivel"}
              </h2>

              {modulesLoading ? (
                <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>
              ) : modules && modules.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModuleId(module.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${selectedModuleId === module.id
                          ? "border-primary bg-primary/5"
                          : "border-border/40 hover:border-primary/40"
                        }`}
                    >
                      <h4 className="font-semibold text-foreground mb-1">{module.name}</h4>
                      <p className="text-sm text-foreground/60 line-clamp-2">{module.description}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Completado: 0%</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No hay módulos disponibles en este nivel.</p>
              )}
            </Card>

            {/* Unidades */}
            {selectedModuleId && (
              <Card className="p-6 border-border/40">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {currentModule?.name} - Unidades
                </h2>
                {unitsLoading ? (
                  <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>
                ) : units && units.length > 0 ? (
                  <div className="space-y-3">
                    {units.map((unit, index) => (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedUnitId(unit.id)}
                        className="w-full p-4 rounded-lg border border-border/40 hover:bg-primary/5 transition-colors text-left group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                {getContentIcon(unit.contentType)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">{unit.name}</h4>
                                <p className="text-xs text-foreground/60 capitalize">{unit.contentType} - {unit.duration} min</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Placeholder logic for status */}
                            {false ? (
                              <CheckCircle className="w-5 h-5 text-secondary" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-muted" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No hay unidades en este módulo.</p>
                )}
              </Card>
            )}

            {/* Detalles de Unidad */}
            {selectedUnitId && currentUnit && (
              <Card className="p-6 border-border/40 bg-gradient-to-br from-primary/5 to-secondary/5">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {currentUnit.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Tipo de Contenido</p>
                    <Badge className="capitalize">
                      {currentUnit.contentType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Duracion Estimada</p>
                    <p className="text-foreground font-semibold">
                      {currentUnit.duration} minutos
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
