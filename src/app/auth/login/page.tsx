'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ThemeToggle } from '@/components/ThemeProvider';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    const router = useRouter();
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            login(data.token, data.user);
            router.push('/dashboard');
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'radial-gradient(ellipse at top left, rgba(236,72,153,0.1) 0%, transparent 50%)',
        }}>
            <div style={{ position: 'fixed', top: 24, right: 24 }}>
                <ThemeToggle />
            </div>

            <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: 440, padding: 40 }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, textDecoration: 'none' }}>
                    <span style={{ fontSize: 32 }}>🚀</span>
                    <span style={{
                        fontSize: 24,
                        fontWeight: 700,
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Resume AI
                    </span>
                </Link>

                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome Back</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
                    Sign in to continue analyzing your resume
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: 20 }}>
                        <label className="input-label">Username or Email</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Enter your username or email"
                            value={formData.username}
                            onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: 24 }}>
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            marginBottom: 20,
                            padding: 16,
                            background: 'rgba(239,68,68,0.1)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(239,68,68,0.2)',
                        }}>
                            <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                        style={{ width: '100%', padding: 14 }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-text-secondary)', fontSize: 14 }}>
                    Don't have an account?{' '}
                    <Link href="/auth/signup" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
