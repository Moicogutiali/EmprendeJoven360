import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const DIAGNOSTIC_QUESTIONS = [
  {
    id: 1,
    question: "Cual es tu experiencia en emprendimiento?",
    options: [
      { value: "none", label: "Ninguna, soy principiante" },
      { value: "some", label: "Tengo algo de experiencia" },
      { value: "experienced", label: "Soy relativamente experimentado" },
      { value: "expert", label: "Tengo mucha experiencia" },
    ],
  },
  {
    id: 2,
    question: "Tienes una idea de negocio clara?",
    options: [
      { value: "no", label: "No, estoy explorando" },
      { value: "vague", label: "Tengo una idea vaga" },
      { value: "clear", label: "Tengo una idea clara" },
      { value: "validated", label: "Ya la he validado" },
    ],
  },
  {
    id: 3,
    question: "Cual es tu principal objetivo?",
    options: [
      { value: "learn", label: "Aprender sobre emprendimiento" },
      { value: "validate", label: "Validar mi idea" },
      { value: "launch", label: "Lanzar mi negocio" },
      { value: "scale", label: "Escalar mi negocio" },
    ],
  },
  {
    id: 4,
    question: "Cuanto tiempo puedes dedicar semanalmente?",
    options: [
      { value: "low", label: "Menos de 5 horas" },
      { value: "medium", label: "5-10 horas" },
      { value: "high", label: "10-20 horas" },
      { value: "full", label: "Mas de 20 horas" },
    ],
  },
  {
    id: 5,
    question: "Cual es tu area de interes principal?",
    options: [
      { value: "tech", label: "Tecnologia" },
      { value: "commerce", label: "E-commerce" },
      { value: "services", label: "Servicios" },
      { value: "social", label: "Impacto Social" },
    ],
  },
];

export default function Diagnostic() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const saveDiagnosticMutation = trpc.diagnostic.saveDiagnostic.useMutation();

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [DIAGNOSTIC_QUESTIONS[currentQuestion].id]: value,
    }));
  };

  const handleNext = () => {
    if (!answers[DIAGNOSTIC_QUESTIONS[currentQuestion].id]) {
      toast.error("Por favor selecciona una respuesta");
      return;
    }

    if (currentQuestion < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== DIAGNOSTIC_QUESTIONS.length) {
      toast.error("Por favor responde todas las preguntas");
      return;
    }

    setIsSubmitting(true);
    try {
      let resultLevel = 1;
      if (answers[1] === "experienced" || answers[1] === "expert") {
        resultLevel = 2;
      }
      if (answers[2] === "launch" || answers[2] === "scale") {
        resultLevel = 3;
      }

      await saveDiagnosticMutation.mutateAsync({
        responses: answers,
        resultLevel,
      });

      setIsCompleted(true);
      toast.success("Diagnostico completado exitosamente!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      toast.error("Error al guardar el diagnostico");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / DIAGNOSTIC_QUESTIONS.length) * 100;
  const question = DIAGNOSTIC_QUESTIONS[currentQuestion];
  const isAnswered = !!answers[question.id];

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-secondary/5 flex items-center justify-center">
        <Card className="p-12 max-w-md text-center border-border/40">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-secondary/10">
              <CheckCircle className="w-12 h-12 text-secondary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Diagnostico Completado!</h2>
          <p className="text-foreground/60 mb-6">
            Tu ruta personalizada ha sido generada. Redirigiendo al dashboard...
          </p>
          <div className="animate-spin inline-block">
            <Loader2 className="w-6 h-6 text-primary" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/2 to-secondary/5">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container h-16 flex items-center justify-between">
          <h1 className="font-bold text-lg text-foreground">Diagnostico Inicial</h1>
          <span className="text-sm text-foreground/60">
            Pregunta {currentQuestion + 1} de {DIAGNOSTIC_QUESTIONS.length}
          </span>
        </div>
      </header>

      <main className="container py-12 max-w-2xl">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-foreground/60 mt-2">{Math.round(progress)}% completado</p>
        </div>

        <Card className="p-8 border-border/40 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {question.question}
          </h2>

          <RadioGroup value={answers[question.id] || ""} onValueChange={handleAnswer}>
            <div className="space-y-4">
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border border-border/40 hover:bg-primary/5 cursor-pointer transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </Card>

        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>

          {currentQuestion === DIAGNOSTIC_QUESTIONS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!isAnswered || isSubmitting}
              className="flex-1 ml-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Completar Diagnostico"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="flex-1 ml-4"
            >
              Siguiente
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
