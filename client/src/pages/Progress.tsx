import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Award, Flame, Target, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const MOCK_PROGRESS_DATA = [
  { level: "Explorador", completed: 0, total: 3 },
  { level: "Constructor", completed: 0, total: 3 },
  { level: "Estratega", completed: 0, total: 3 },
  { level: "Lider", completed: 0, total: 3 },
  { level: "Visionario", completed: 0, total: 3 },
];

const MOCK_LEARNING_CURVE = [
  { week: "Semana 1", points: 150 },
  { week: "Semana 2", points: 320 },
  { week: "Semana 3", points: 280 },
  { week: "Semana 4", points: 450 },
];

const MOCK_BADGES = [
  { id: 1, name: "Primer Paso", icon: "🚀", description: "Completa tu primer modulo" },
  { id: 2, name: "Aprendiz", icon: "📚", description: "Completa 5 unidades" },
  { id: 3, name: "Explorador", icon: "🧭", description: "Completa el nivel Explorador" },
  { id: 4, name: "Racha de Fuego", icon: "🔥", description: "7 dias consecutivos" },
];

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
    <div className="bg-primary h-full transition-all" style={{ width: `${value}%` }}></div>
  </div>
);

export default function Progress() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: gamification, isLoading: gamLoading } = trpc.progress.getGamification.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (gamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-foreground/60">Cargando progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-secondary/5">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container h-16 flex items-center justify-between">
          <h1 className="font-bold text-lg text-foreground">Mi Progreso</h1>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Volver
          </Button>
        </div>
      </header>

      <main className="container py-12">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-border/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Puntos Totales</p>
                <p className="text-3xl font-bold text-primary">{gamification?.totalPoints || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Star className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Nivel Actual</p>
                <p className="text-3xl font-bold text-secondary">{gamification?.currentLevel || 1}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Insignias</p>
                <p className="text-3xl font-bold text-accent">{gamification?.badges?.length || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10">
                <Award className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Racha Actual</p>
                <p className="text-3xl font-bold text-primary">{gamification?.streak || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Flame className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Curva de Aprendizaje */}
          <Card className="p-6 border-border/40">
            <h3 className="text-lg font-bold text-foreground mb-4">Curva de Aprendizaje</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={MOCK_LEARNING_CURVE}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="week" stroke="rgba(0,0,0,0.5)" />
                <YAxis stroke="rgba(0,0,0,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.1)" }} />
                <Line type="monotone" dataKey="points" stroke="#6366F1" strokeWidth={2} dot={{ fill: "#6366F1" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Progreso por Nivel */}
          <Card className="p-6 border-border/40">
            <h3 className="text-lg font-bold text-foreground mb-4">Progreso por Nivel</h3>
            <div className="space-y-4">
              {MOCK_PROGRESS_DATA.map((item) => (
                <div key={item.level}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-foreground">{item.level}</span>
                    <span className="text-xs text-foreground/60">{item.completed}/{item.total}</span>
                  </div>
                  <ProgressBar value={(item.completed / item.total) * 100} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Insignias */}
        <Card className="p-6 border-border/40 mb-8">
          <h3 className="text-lg font-bold text-foreground mb-6">Insignias Desbloqueadas</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {MOCK_BADGES.map((badge) => (
              <div key={badge.id} className="p-4 rounded-lg border border-border/40 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h4 className="font-semibold text-foreground mb-1">{badge.name}</h4>
                <p className="text-xs text-foreground/60">{badge.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Proximos Hitos */}
        <Card className="p-6 border-border/40">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Proximos Hitos
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-border/40 bg-primary/5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-foreground">Completar Nivel Explorador</h4>
                <Badge>1/3 completado</Badge>
              </div>
              <ProgressBar value={33} />
              <p className="text-xs text-foreground/60 mt-2">Completa 2 unidades mas para desbloquear el siguiente nivel</p>
            </div>

            <div className="p-4 rounded-lg border border-border/40 bg-secondary/5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-foreground">Alcanzar 1000 Puntos</h4>
                <Badge variant="secondary">450/1000 puntos</Badge>
              </div>
              <ProgressBar value={45} />
              <p className="text-xs text-foreground/60 mt-2">Te faltan 550 puntos para este hito</p>
            </div>

            <div className="p-4 rounded-lg border border-border/40 bg-accent/5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-foreground">Racha de 7 Dias</h4>
                <Badge variant="outline">2/7 dias</Badge>
              </div>
              <ProgressBar value={28} />
              <p className="text-xs text-foreground/60 mt-2">Mantente activo 5 dias mas para desbloquear insignia</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
