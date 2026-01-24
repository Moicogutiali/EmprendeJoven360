import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const [, navigate] = useLocation();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase will automatically handle the callback
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error in auth callback:', error);
                    navigate('/auth?error=' + encodeURIComponent(error.message));
                    return;
                }

                if (session) {
                    // Sync user with database
                    const { user } = session;

                    // Create or update user in our database
                    const { error: dbError } = await supabase
                        .from('users')
                        .upsert({
                            openId: user.id,
                            email: user.email,
                            name: user.user_metadata?.name || user.email?.split('@')[0],
                            loginMethod: 'supabase',
                            lastSignedIn: new Date().toISOString(),
                        }, {
                            onConflict: 'openId'
                        });

                    if (dbError) {
                        console.error('Error syncing user:', dbError);
                    }

                    navigate('/dashboard');
                } else {
                    navigate('/auth');
                }
            } catch (error) {
                console.error('Unexpected error in callback:', error);
                navigate('/auth');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-foreground/60">Completando autenticación...</p>
            </div>
        </div>
    );
}
