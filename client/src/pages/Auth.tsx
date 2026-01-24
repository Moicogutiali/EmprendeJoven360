import { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Github, Chrome } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AuthPage() {
    const [, navigate] = useLocation();
    const { signIn, signUp, signInWithOAuth, loading, error } = useSupabaseAuth();

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);

        try {
            await signIn(loginEmail, loginPassword);
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Login error:", err);
            setAuthError(err.message || err.error_description || 'Error al iniciar sesión');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);

        if (registerPassword !== confirmPassword) {
            setAuthError('Las contraseñas no coinciden');
            return;
        }

        if (registerPassword.length < 6) {
            setAuthError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            await signUp(registerEmail, registerPassword, { name: registerName });
            setAuthError(null);
            // Show success message
            alert('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
        } catch (err: any) {
            console.error("Registration error:", err);
            setAuthError(err.message || err.error_description || 'Error al registrarse');
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        setAuthError(null);
        try {
            await signInWithOAuth(provider);
        } catch (err: any) {
            console.error("OAuth error:", err);
            setAuthError(err.message || err.error_description || 'Error al iniciar sesión con OAuth');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-border/40">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        EmprendeJoven 360
                    </CardTitle>
                    <CardDescription className="text-center">
                        Inicia sesión o crea una cuenta para comenzar tu viaje emprendedor
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                            <TabsTrigger value="register">Registrarse</TabsTrigger>
                        </TabsList>

                        {/* Login Tab */}
                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="tu@email.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Contraseña</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                {authError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{authError}</AlertDescription>
                                    </Alert>
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Iniciando sesión...
                                        </>
                                    ) : (
                                        'Iniciar Sesión'
                                    )}
                                </Button>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            O continúa con
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleOAuthLogin('google')}
                                        disabled={loading}
                                    >
                                        <Chrome className="mr-2 h-4 w-4" />
                                        Google
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleOAuthLogin('github')}
                                        disabled={loading}
                                    >
                                        <Github className="mr-2 h-4 w-4" />
                                        GitHub
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>

                        {/* Register Tab */}
                        <TabsContent value="register">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-name">Nombre</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="register-name"
                                            type="text"
                                            placeholder="Tu nombre"
                                            value={registerName}
                                            onChange={(e) => setRegisterName(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="tu@email.com"
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Contraseña</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="register-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                {authError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{authError}</AlertDescription>
                                    </Alert>
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Registrando...
                                        </>
                                    ) : (
                                        'Crear Cuenta'
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2">
                    <Button
                        variant="link"
                        className="text-sm"
                        onClick={() => navigate('/')}
                    >
                        Volver al inicio
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
