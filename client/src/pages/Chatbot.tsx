import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { Sparkles, Brain, Briefcase, Rocket, LogOut, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

type ChatRole = "mentor" | "asesor" | "motivador";

export default function Chatbot() {
    const { isAuthenticated, loading } = useAuth();
    const [, navigate] = useLocation();
    const [activeRole, setActiveRole] = useState<ChatRole>("mentor");

    // Query and mutation are separate for each role to maintain states
    const { data: interaction, isLoading: historyLoading, refetch } = trpc.chatbot.getConversation.useQuery(
        { role: activeRole },
        { enabled: isAuthenticated }
    );

    const sendMessageMutation = trpc.chatbot.sendMessage.useMutation({
        onSuccess: () => {
            refetch();
        },
        onError: (err) => {
            toast.error("Error al enviar mensaje: " + err.message);
        }
    });

    // Transform DB messages to AIChatBox format
    const messages = useMemo(() => {
        if (!interaction?.messages) return [];
        return interaction.messages.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: m.content
        }));
    }, [interaction]);

    const handleSend = (content: string) => {
        sendMessageMutation.mutate({ role: activeRole, message: content });
    };

    if (loading || !isAuthenticated) {
        if (!loading) navigate("/");
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    const roleConfig = {
        mentor: {
            title: "Mentor Educativo",
            description: "Explica conceptos y resuelve dudas teóricas.",
            icon: <Brain className="w-5 h-5" />,
            color: "bg-blue-500/10 text-blue-600",
            prompts: ["¿Qué es una propuesta de valor?", "¿Cómo funciona el Canvas?", "Explícame sobre el punto de equilibrio."]
        },
        asesor: {
            title: "Asesor Estratégico",
            description: "Orientación práctica sobre tu idea de negocio.",
            icon: <Briefcase className="w-5 h-5" />,
            color: "bg-purple-500/10 text-purple-600",
            prompts: ["Analiza mi idea de negocio", "¿Cómo valido mi producto?", "¿Qué modelo de ingresos me recomiendas?"]
        },
        motivador: {
            title: "Motivador 360",
            description: "Impulso y energía para tu camino emprendedor.",
            icon: <Rocket className="w-5 h-5" />,
            color: "bg-orange-500/10 text-orange-600",
            prompts: ["Necesito motivación hoy", "Tengo miedo a empezar", "Celebra mi primer módulo terminado"]
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="container h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        <h1 className="font-bold text-lg">Asistente AI Inteligente</h1>
                    </div>
                    <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                        Volver
                    </Button>
                </div>
            </header>

            <main className="container py-8 max-w-5xl">
                <Tabs defaultValue="mentor" onValueChange={(v) => setActiveRole(v as ChatRole)} className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground">Tu equipo de apoyo</h2>
                            <p className="text-muted-foreground">Selecciona el perfil de coach que necesitas en este momento.</p>
                        </div>
                        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
                            <TabsTrigger value="mentor" className="gap-2">
                                <Brain className="w-4 h-4" /> Mentor
                            </TabsTrigger>
                            <TabsTrigger value="asesor" className="gap-2">
                                <Briefcase className="w-4 h-4" /> Asesor
                            </TabsTrigger>
                            <TabsTrigger value="motivador" className="gap-2">
                                <Rocket className="w-4 h-4" /> Coach
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="p-6 border-border/40">
                                <div className={cn("p-3 rounded-full w-fit mb-4", roleConfig[activeRole].color)}>
                                    {roleConfig[activeRole].icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{roleConfig[activeRole].title}</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {roleConfig[activeRole].description}
                                </p>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Preguntas sugeridas</p>
                                    {roleConfig[activeRole].prompts.map((p, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(p)}
                                            className="w-full text-left text-sm p-2 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6 border-primary/20 bg-primary/5">
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Tip de IA
                                </h4>
                                <p className="text-xs text-foreground/70">
                                    El Mentor es el mejor para estudiar los contenidos de los módulos. El Asesor puede ayudarte a crear tu plan de negocios real.
                                </p>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            <AIChatBox
                                messages={messages}
                                onSendMessage={handleSend}
                                isLoading={sendMessageMutation.isPending || historyLoading}
                                height="calc(100vh - 280px)"
                                placeholder={`Habla con tu ${activeRole}...`}
                                emptyStateMessage={`¡Hola! Soy tu ${roleConfig[activeRole].title}. ¿En qué puedo ayudarte hoy?`}
                                className="border-border/40 shadow-xl"
                            />
                        </div>
                    </div>
                </Tabs>
            </main>
        </div>
    );
}

// Helper to keep the code clean
import { cn } from "@/lib/utils";
