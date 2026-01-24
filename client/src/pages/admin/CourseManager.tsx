import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, ChevronRight, BookOpen, Layers, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function CourseManager() {
    const { user, isAuthenticated, loading } = useAuth();
    const [, navigate] = useLocation();

    const { data: phases, isLoading, refetch } = trpc.learning.getPhases.useQuery();

    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated || user?.role !== 'admin') {
        navigate("/");
        return null;
    }

    return (
        <div className="container py-8 mx-auto max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
                    <p className="text-muted-foreground">Administra la estructura académica: Fases, Niveles, Módulos y Unidades.</p>
                </div>
                <CreatePhaseDialog onSuccess={refetch} />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                        {phases?.map((phase) => (
                            <PhaseItem key={phase.id} phase={phase} onRefresh={refetch} />
                        ))}
                    </Accordion>
                </div>
            )}
        </div>
    );
}

function PhaseItem({ phase, onRefresh }: { phase: any, onRefresh: () => void }) {
    const utils = trpc.useContext();
    const deletePhase = trpc.admin.learning.deletePhase.useMutation({
        onSuccess: () => {
            toast.success("Fase eliminada");
            onRefresh();
        }
    });

    const { data: levels, refetch: refetchLevels } = trpc.learning.getLevelsByPhase.useQuery({ phaseId: phase.id });

    return (
        <AccordionItem value={`phase-${phase.id}`} className="border rounded-lg mb-4 px-4">
            <div className="flex items-center justify-between py-2">
                <AccordionTrigger className="hover:no-underline flex-1">
                    <div className="flex items-center gap-3 text-left">
                        <span className="font-bold text-lg">{phase.name}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{levels?.length || 0} Niveles</span>
                    </div>
                </AccordionTrigger>
                <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deletePhase.mutate({ id: phase.id }); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </div>
            <AccordionContent className="pt-2 pb-6">
                <div className="pl-4 border-l-2 border-primary/20 ml-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-sm text-foreground/70">Niveles en esta fase</h4>
                        <CreateLevelDialog phaseId={phase.id} onSuccess={refetchLevels} />
                    </div>
                    {levels?.map(level => (
                        <LevelItem key={level.id} level={level} onRefresh={refetchLevels} />
                    ))}
                    {levels?.length === 0 && <p className="text-sm text-muted-foreground italic">No hay niveles creados.</p>}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

function LevelItem({ level, onRefresh }: { level: any, onRefresh: () => void }) {
    const deleteLevel = trpc.admin.learning.deleteLevel.useMutation({
        onSuccess: () => { toast.success("Nivel eliminado"); onRefresh(); }
    });
    const { data: modules, refetch: refetchModules } = trpc.learning.getModulesByLevel.useQuery({ levelId: level.id });

    // Simple accordion state local since we are nesting manual components
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card className="border-l-4 border-l-secondary/50">
            <div className="p-4 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    <div>
                        <h4 className="font-semibold">{level.name}</h4>
                        <p className="text-xs text-muted-foreground">{modules?.length || 0} Módulos</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => deleteLevel.mutate({ id: level.id })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </div>

            {isOpen && (
                <div className="p-4 pt-0 bg-muted/20 border-t">
                    <div className="mt-4 flex justify-between items-center mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Módulos</span>
                        <CreateModuleDialog levelId={level.id} onSuccess={refetchModules} />
                    </div>
                    <div className="grid gap-4">
                        {modules?.map(module => (
                            <ModuleItem key={module.id} module={module} onRefresh={refetchModules} />
                        ))}
                        {modules?.length === 0 && <p className="text-sm text-muted-foreground italic">No hay módulos.</p>}
                    </div>
                </div>
            )}
        </Card>
    )
}

function ModuleItem({ module, onRefresh }: { module: any, onRefresh: () => void }) {
    const deleteModule = trpc.admin.learning.deleteModule.useMutation({
        onSuccess: () => { toast.success("Módulo eliminado"); onRefresh(); }
    });
    const { data: units, refetch: refetchUnits } = trpc.learning.getUnitsByModule.useQuery({ moduleId: module.id });
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-background border rounded-md p-3">
            <div className="flex items-center justify-between">
                <div
                    className="flex items-center gap-2 cursor-pointer select-none flex-1"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div>
                        <h5 className="font-medium text-sm">{module.name}</h5>
                        <p className="text-xs text-muted-foreground">{units?.length || 0} Unidades</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteModule.mutate({ id: module.id })}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                </div>
            </div>

            {isOpen && (
                <div className="mt-3 pl-6 border-l ml-2 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-muted-foreground">Unidades de aprendizaje</span>
                        <CreateUnitDialog moduleId={module.id} onSuccess={refetchUnits} />
                    </div>
                    {units?.map(unit => (
                        <div key={unit.id} className="flex justify-between items-center text-sm p-2 hover:bg-muted/50 rounded border border-transparent hover:border-border">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-secondary"></div>
                                <span>{unit.name}</span>
                                <span className="text-xs text-muted-foreground px-1 border rounded bg-muted uppercase">{unit.contentType}</span>
                            </div>
                            <DeleteUnitButton unitId={unit.id} onSuccess={refetchUnits} />
                        </div>
                    ))}
                    {units?.length === 0 && <p className="text-xs text-muted-foreground">Sin unidades.</p>}
                </div>
            )}
        </div>
    )
}

// --- DIALOGS ---

function CreatePhaseDialog({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const formSchema = z.object({
        name: z.string().min(1, "Nombre requerido"),
        description: z.string().optional(),
        order: z.string().transform(v => parseInt(v)).or(z.number()),
    });
    const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { name: "", description: "", order: 1 } });
    const mutation = trpc.admin.learning.createPhase.useMutation({
        onSuccess: () => { setOpen(false); form.reset(); toast.success("Fase creada"); onSuccess(); }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nueva Fase</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Crear Fase</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(d => mutation.mutate(d))} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Descripción</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="order" render={({ field }) => (
                            <FormItem><FormLabel>Orden</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={mutation.isPending}>Crear</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function CreateLevelDialog({ phaseId, onSuccess }: { phaseId: number, onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const formSchema = z.object({
        name: z.string().min(1, "Requerido"),
        description: z.string().optional(),
        order: z.string().transform(v => parseInt(v)).or(z.number()),
    });
    const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { name: "", description: "", order: 1 } });
    const mutation = trpc.admin.learning.createLevel.useMutation({
        onSuccess: () => { setOpen(false); form.reset(); toast.success("Nivel creado"); onSuccess(); }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" /> Nivel</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Nuevo Nivel</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(d => mutation.mutate({ ...d, phaseId }))} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Descripción</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="order" render={({ field }) => (
                            <FormItem><FormLabel>Orden</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={mutation.isPending}>Crear</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function CreateModuleDialog({ levelId, onSuccess }: { levelId: number, onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const formSchema = z.object({
        name: z.string().min(1, "Requerido"),
        description: z.string().optional(),
        order: z.string().transform(v => parseInt(v)).or(z.number()),
    });
    const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { name: "", description: "", order: 1 } });
    const mutation = trpc.admin.learning.createModule.useMutation({
        onSuccess: () => { setOpen(false); form.reset(); toast.success("Módulo creado"); onSuccess(); }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline" className="h-7"><Plus className="h-3 w-3 mr-1" /> Módulo</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Nuevo Módulo</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(d => mutation.mutate({ ...d, levelId }))} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Descripción</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="order" render={({ field }) => (
                            <FormItem><FormLabel>Orden</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={mutation.isPending}>Crear</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function CreateUnitDialog({ moduleId, onSuccess }: { moduleId: number, onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const formSchema = z.object({
        name: z.string().min(1, "Requerido"),
        description: z.string().optional(),
        order: z.string().transform(v => parseInt(v)).or(z.number()),
        contentType: z.enum(["video", "podcast", "ebook", "infografia", "quiz"]),
        duration: z.string().transform(v => parseInt(v)).or(z.number()).optional(),
    });
    const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { name: "", description: "", order: 1, contentType: "video", duration: 15 } });
    const mutation = trpc.admin.learning.createUnit.useMutation({
        onSuccess: () => { setOpen(false); form.reset(); toast.success("Unidad creada"); onSuccess(); }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" variant="secondary" className="h-6 text-xs"><Plus className="h-3 w-3 mr-1" /> Agregar Unidad</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Nueva Unidad</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(d => mutation.mutate({ ...d, moduleId }))} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="contentType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Contenido</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="podcast">Podcast</SelectItem>
                                        <SelectItem value="ebook">Ebook</SelectItem>
                                        <SelectItem value="infografia">Infografía</SelectItem>
                                        <SelectItem value="quiz">Quiz</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="order" render={({ field }) => (
                                <FormItem><FormLabel>Orden</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="duration" render={({ field }) => (
                                <FormItem><FormLabel>Duración (min)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <Button type="submit" disabled={mutation.isPending}>Crear</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function DeleteUnitButton({ unitId, onSuccess }: { unitId: number, onSuccess: () => void }) {
    const mutation = trpc.admin.learning.deleteUnit.useMutation({
        onSuccess: () => { toast.success("Eliminado"); onSuccess(); }
    });
    return (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => mutation.mutate({ id: unitId })}>
            <Trash2 className="h-3 w-3 text-destructive/70" />
        </Button>
    )
}
