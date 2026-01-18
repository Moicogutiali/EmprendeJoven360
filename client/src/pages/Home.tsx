import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, Zap, Users, TrendingUp, Award, BookOpen, ChevronRight, Brain, Target, Star, MessageSquare } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function Home() {
  const { t } = useTranslation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground/60">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-secondary/5">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">EmprendeJoven 360</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground/70">{t('welcome')}, {user.name}</span>
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                {t('dashboard.title')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Diagnóstico */}
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border/40" onClick={() => navigate("/diagnostic")}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{t('dashboard.diagnostic')}</h3>
              <p className="text-sm text-foreground/60">Evalúa tu nivel de conocimiento y obtén una ruta personalizada</p>
            </Card>

            {/* Aprendizaje */}
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border/40" onClick={() => navigate("/learning")}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{t('nav.learning')}</h3>
              <p className="text-sm text-foreground/60">Accede a contenido en múltiples formatos: videos, podcasts, eBooks</p>
            </Card>

            {/* Progreso */}
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border/40" onClick={() => navigate("/progress")}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{t('nav.progress')}</h3>
              <p className="text-sm text-foreground/60">Visualiza tu avance, logros y próximos pasos en tu ruta</p>
            </Card>

            {/* Gamificación */}
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border/40" onClick={() => navigate("/gamification")}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Award className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Gamificación</h3>
              <p className="text-sm text-foreground/60">Desbloquea insignias, gana puntos y sube de nivel</p>
            </Card>

            {/* Mentoría */}
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border/40" onClick={() => navigate("/mentorship")}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{t('nav.mentorship')}</h3>
              <p className="text-sm text-foreground/60">Conecta con mentores y recibe orientación personalizada</p>
            </Card>

            {/* Chatbot */}
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border/40" onClick={() => navigate("/chatbot")}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{t('nav.chatbot')}</h3>
              <p className="text-sm text-foreground/60">Interactúa con tu asistente virtual de emprendimiento</p>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">EmprendeJoven 360</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button asChild>
              <a href={getLoginUrl()}>{t('home.cta_start')}</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container py-20 flex flex-col justify-center">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('home.hero_title')}
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              {t('home.hero_subtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <a href={getLoginUrl()}>{t('home.cta_start')}</a>
            </Button>
            <Button size="lg" variant="outline">
              {t('home.cta_learn')}
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-20">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Diagnóstico Adaptativo</h3>
              <p className="text-sm text-foreground/60">Evaluación inteligente que define tu ruta de aprendizaje personalizada</p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">Contenido Multiformato</h3>
              <p className="text-sm text-foreground/60">Videos, podcasts, eBooks, infografías y quizzes interactivos</p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Mentoría Personalizada</h3>
              <p className="text-sm text-foreground/60">Conecta con mentores expertos y chatbot IA multirrol</p>
            </div>
          </div>
          {/* ... stats and footer ... */}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 py-8">
        <div className="container text-center text-sm text-foreground/60">
          <p>© 2026 EmprendeJoven 360. Transformando ideas en realidades.</p>
        </div>
      </footer>
    </div>
  );
}
