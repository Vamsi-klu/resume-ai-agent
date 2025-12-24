'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ThemeToggle } from '@/components/ThemeProvider';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
    const router = useRouter();
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    useEffect(() => {
        const password = formData.password;
        let strength = 0;
        if (password.length >= 12) strength += 20;
        if (password.length >= 16) strength += 10;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[a-z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 20;
        setPasswordStrength(Math.min(100, strength));
    }, [formData.password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);

        if (formData.password !== formData.confirmPassword) {
            setErrors(['Passwords do not match']);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors(data.details || [data.error]);
                return;
            }

            login(data.token, data.user);
            router.push('/dashboard');
        } catch (error) {
            setErrors(['An error occurred. Please try again.']);
        } finally {
            setIsLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength < 40) return 'var(--color-error)';
        if (passwordStrength < 70) return 'var(--color-warning)';
        return 'var(--color-success)';
    };

    const getStrengthLabel = () => {
        if (passwordStrength < 40) return 'Weak';
        if (passwordStrength < 70) return 'Medium';
        if (passwordStrength < 100) return 'Strong';
        return 'Very Strong';
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.1) 0%, transparent 50%)',
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

                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create Account</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
                    Join thousands optimizing their resumes with AI
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: 20 }}>
                        <label className="input-label">Username</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="johndoe or john@example.com"
                            value={formData.username}
                            onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            required
                            minLength={3}
                        />
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            Can be anything: name, email, or custom ID
                        </span>
                    </div>

                    <div className="input-group" style={{ marginBottom: 20 }}>
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: 20 }}>
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className={`input ${errors.length > 0 ? 'input-error' : ''}`}
                            placeholder="Min 12 characters, mixed case, number, symbol"
                            value={formData.password}
                            onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            required
                            minLength={12}
                        />
                        {formData.password && (
                            <div style={{ marginTop: 8 }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 4,
                                    fontSize: 12,
                                }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Password strength</span>
                                    <span style={{ color: getStrengthColor(), fontWeight: 500 }}>{getStrengthLabel()}</span>
                                </div>
                                <div style={{
                                    height: 4,
                                    background: 'var(--color-background-tertiary)',
                                    borderRadius: 'var(--radius-full)',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${passwordStrength}%`,
                                        background: getStrengthColor(),
                                        transition: 'all var(--transition-normal)',
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="input-group" style={{ marginBottom: 24 }}>
                        <label className="input-label">Confirm Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                        />
                    </div>

                    {errors.length > 0 && (
                        <div style={{
                            marginBottom: 20,
                            padding: 16,
                            background: 'rgba(239,68,68,0.1)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(239,68,68,0.2)',
                        }}>
                            {errors.map((error, i) => (
                                <p key={i} style={{ color: 'var(--color-error)', fontSize: 14, marginBottom: i < errors.length - 1 ? 4 : 0 }}>
                                    • {error}
                                </p>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                        style={{ width: '100%', padding: 14 }}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-text-secondary)', fontSize: 14 }}>
                    Already have an account?{' '}
                    <Link href="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
