import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, PlayCircle, Headphones, FileText, ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UnitPlayerProps {
    unitId: number;
    onClose?: () => void;
}

export function UnitPlayer({ unitId, onClose }: UnitPlayerProps) {
    const queryClient = useQueryClient();
    const { data: unit, isLoading } = trpc.learning.getUnitDetails.useQuery({ unitId });
    const completeUnitMutation = trpc.progress.completeUnit.useMutation({
        onSuccess: (data) => {
            if (data.alreadyCompleted) {
                toast.info("¡Esta unidad ya estaba completada!");
            } else {
                toast.success(`¡Unidad completada! +${data.pointsAwarded} puntos`);
                // Invalidate queries to refresh progress and points
                queryClient.invalidateQueries({ queryKey: [["progress", "getCompletedUnits"]] });
                queryClient.invalidateQueries({ queryKey: [["progress", "getGamification"]] });
            }
        },
        onError: () => {
            toast.error("Error al completar la unidad");
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!unit) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">No se encontró la unidad.</p>
                <Button variant="ghost" className="mt-4" onClick={onClose}>Cerrar</Button>
            </Card>
        );
    }

    const handleComplete = () => {
        completeUnitMutation.mutate({ unitId: unit.id });
    };

    const renderContent = () => {
        switch (unit.contentType) {
            case "video":
                return (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group">
                        {unit.contentUrl ? (
                            <iframe
                                src={unit.contentUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                                <PlayCircle className="w-20 h-20 mb-4" />
                                <p>Visualizador de video próximamente</p>
                            </div>
                        )}
                    </div>
                );
            case "podcast":
                return (
                    <div className="p-8 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl border border-border/40 text-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Headphones className="w-10 h-10 text-primary" />
                        </div>
                        <h4 className="text-xl font-bold mb-4">Reproductor de Podcast</h4>
                        {unit.contentUrl ? (
                            <audio controls className="w-full mt-4">
                                <source src={unit.contentUrl} type="audio/mpeg" />
                                Tu navegador no soporta el audio.
                            </audio>
                        ) : (
                            <p className="text-muted-foreground italic">Cargando audio...</p>
                        )}
                    </div>
                );
            case "ebook":
            case "infografia":
                return (
                    <div className="p-8 bg-background rounded-xl border border-border/40 flex flex-col items-center">
                        <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center mb-6">
                            {unit.contentType === 'ebook' ? <FileText className="w-8 h-8 text-accent" /> : <ImageIcon className="w-8 h-8 text-accent" />}
                        </div>
                        <p className="text-center mb-6 text-foreground/80">
                            {unit.contentType === 'ebook' ? 'Este recurso es un E-book descargable o visualizable.' : 'Esta es una infografía de microaprendizaje.'}
                        </p>
                        {unit.contentUrl && (
                            <Button asChild variant="outline" className="gap-2">
                                <a href={unit.contentUrl} target="_blank" rel="noopener noreferrer">
                                    Visualizar Recurso <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="p-12 text-center text-muted-foreground italic">
                        Visualizador para {unit.contentType} en desarrollo.
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <Badge variant="outline" className="mb-2 capitalize">
                        {unit.contentType} • {unit.duration} min
                    </Badge>
                    <h2 className="text-2xl font-bold text-foreground">{unit.name}</h2>
                    <p className="text-foreground/60">{unit.description}</p>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <span className="sr-only">Cerrar</span>
                        <CheckCircle className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {renderContent()}

            <div className="flex justify-end gap-4 pt-4 border-t border-border/40">
                <Button
                    onClick={handleComplete}
                    disabled={completeUnitMutation.isPending}
                    className="gap-2"
                >
                    {completeUnitMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <CheckCircle className="w-4 h-4" />
                    )}
                    Marcar como Completado
                </Button>
            </div>
        </div>
    );
}
