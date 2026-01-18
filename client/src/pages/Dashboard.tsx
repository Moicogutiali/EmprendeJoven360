import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Award, TrendingUp, BookOpen, LogOut } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: gamification, isLoading: gamLoading } = trpc.progress.getGamification.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground/60">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">EmprendeJoven 360</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground/70">{user?.name}</span>
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('welcome')}, {user?.name}!
          </h1>
          <p className="text-lg text-foreground/60">
            {t('home.hero_subtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border-border/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">{t('dashboard.points')}</p>
                <p className="text-3xl font-bold text-primary">
                  {gamLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : gamification?.totalPoints || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Award className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">{t('dashboard.level')}</p>
                <p className="text-3xl font-bold text-secondary">
                  {gamLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : gamification?.currentLevel || 1}
                </p>
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
                <p className="text-3xl font-bold text-accent">
                  {gamLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : gamification?.badges?.length || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10">
                <Award className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">{t('dashboard.streak')}</p>
                <p className="text-3xl font-bold text-primary">
                  {gamLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : gamification?.streak || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 border-border/40 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t('dashboard.diagnostic')}</h3>
                <p className="text-foreground/60">Evalúa tu nivel y obtén una ruta personalizada</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => navigate("/diagnostic")}
            >
              {t('dashboard.diagnostic')}
            </Button>
          </Card>

          <Card className="p-8 border-border/40 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t('nav.learning')}</h3>
                <p className="text-foreground/60">Accede a contenido en múltiples formatos</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/10">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => navigate("/learning")}
              variant="outline"
            >
              {t('dashboard.explore')}
            </Button>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-8 border-border/40 mt-6">
          <h3 className="text-xl font-bold text-foreground mb-6">Actividad Reciente</h3>
          <div className="space-y-4">
            <p className="text-foreground/60 text-center py-8">
              No hay actividad reciente. ¡Comienza tu viaje de aprendizaje!
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
