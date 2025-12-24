'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, RequireAuth } from '@/components/AuthProvider';
import { ThemeToggle } from '@/components/ThemeProvider';
import FileUpload from '@/components/FileUpload';
import AnalysisResults from '@/components/AnalysisResults';
import FeedbackModal from '@/components/FeedbackModal';

export const dynamic = 'force-dynamic';

type GeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash-exp';

const MODELS: Array<{ id: GeminiModel; name: string; description: string }> = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast & efficient' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: 'Latest & greatest' },
];

function DashboardContent() {
    const { user, rateLimit, logout, refreshUser } = useAuth();
    const [extractedText, setExtractedText] = useState<string | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-1.5-flash');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const { token } = useAuth();

    const handleFilesUploaded = (files: any[], text: string | null) => {
        setExtractedText(text);
        setAnalysisResult(null);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!extractedText && !jobDescription) {
            setError('Please upload a resume and provide a job description');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    resumeText: extractedText,
                    jobDescription,
                    model: selectedModel,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Analysis failed');
            }

            setAnalysisResult(data);
            await refreshUser(); // Refresh rate limit
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formatResetTime = (resetAt: string) => {
        const date = new Date(resetAt);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                padding: '16px 24px',
                background: 'var(--gradient-glass)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--color-border)',
            }}>
                <div style={{
                    maxWidth: 1400,
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <span style={{ fontSize: 28 }}>🚀</span>
                        <span style={{
                            fontSize: 20,
                            fontWeight: 700,
                            background: 'var(--gradient-primary)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Resume AI
                        </span>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Rate Limit Indicator */}
                        {rateLimit && (
                            <div className="tooltip" data-tooltip={`Resets in ${formatResetTime(rateLimit.resetAt)}`}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 16px',
                                    background: 'var(--color-background-secondary)',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: 13,
                                }}>
                                    <span>⚡</span>
                                    <span style={{ fontWeight: 600 }}>{rateLimit.remaining}/5</span>
                                    <span style={{ color: 'var(--color-text-muted)' }}>queries left</span>
                                </div>
                            </div>
                        )}

                        <ThemeToggle />

                        <button
                            onClick={() => setShowFeedback(true)}
                            className="btn btn-ghost"
                            style={{ padding: '8px 16px' }}
                        >
                            💬 Feedback
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                background: 'var(--gradient-primary)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                            }}>
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                        Welcome back, {user?.username}! 👋
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Upload your resume and job description to get AI-powered insights.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }}>
                    {/* Upload Section */}
                    <div className="card">
                        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>📄</span> Upload Resume
                        </h2>
                        <FileUpload onFilesUploaded={handleFilesUploaded} />

                        {extractedText && (
                            <div style={{ marginTop: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                        Extracted Text Preview
                                    </span>
                                    <span className="badge badge-success">Ready</span>
                                </div>
                                <div style={{
                                    maxHeight: 150,
                                    overflow: 'auto',
                                    padding: 12,
                                    background: 'var(--color-background-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 13,
                                    color: 'var(--color-text-secondary)',
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {extractedText.substring(0, 500)}
                                    {extractedText.length > 500 && '...'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Job Description Section */}
                    <div className="card">
                        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>💼</span> Job Description
                        </h2>
                        <div className="input-group">
                            <textarea
                                className="input"
                                rows={10}
                                placeholder="Paste the job description you're targeting here..."
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                                style={{ resize: 'vertical', minHeight: 200 }}
                            />
                            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'right' }}>
                                {jobDescription.length} characters
                            </span>
                        </div>
                    </div>
                </div>

                {/* Model Selection & Analyze */}
                <div className="card" style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                        <div>
                            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-secondary)' }}>
                                Select AI Model
                            </h3>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {MODELS.map(model => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModel(model.id)}
                                        style={{
                                            padding: '10px 16px',
                                            background: selectedModel === model.id ? 'var(--gradient-primary)' : 'var(--color-background-secondary)',
                                            color: selectedModel === model.id ? 'white' : 'var(--color-text-primary)',
                                            border: '1px solid',
                                            borderColor: selectedModel === model.id ? 'transparent' : 'var(--color-border)',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                        }}
                                    >
                                        <span style={{ fontWeight: 600 }}>{model.name}</span>
                                        <span style={{ display: 'block', fontSize: 11, opacity: 0.8, marginTop: 2 }}>
                                            {model.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            className="btn btn-primary"
                            disabled={isAnalyzing || (!extractedText && !jobDescription) || (rateLimit?.remaining === 0)}
                            style={{ padding: '16px 40px', fontSize: 16 }}
                        >
                            {isAnalyzing ? (
                                <>
                                    <span className="skeleton" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                                    Analyzing...
                                </>
                            ) : (
                                <>🔍 Analyze Resume</>
                            )}
                        </button>
                    </div>

                    {rateLimit && rateLimit.remaining === 0 && (
                        <div style={{
                            marginTop: 16,
                            padding: 12,
                            background: 'rgba(245,158,11,0.1)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-warning)',
                            fontSize: 14,
                        }}>
                            You've used all 5 queries for today. Resets in {formatResetTime(rateLimit.resetAt)}.
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div style={{
                        marginBottom: 32,
                        padding: 20,
                        background: 'rgba(239,68,68,0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid rgba(239,68,68,0.2)',
                    }}>
                        <h3 style={{ color: 'var(--color-error)', fontWeight: 600, marginBottom: 8 }}>⚠️ Error</h3>
                        <p style={{ color: 'var(--color-error)' }}>{error}</p>
                    </div>
                )}

                {/* Analysis Loading State */}
                {isAnalyzing && (
                    <div className="glass-card" style={{ padding: 60, textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Analyzing your resume...</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            Our AI is comparing your resume with the job description
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                            {[0, 1, 2].map(i => (
                                <div
                                    key={i}
                                    className="skeleton"
                                    style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        animation: `pulse-glow 1.5s ease-in-out ${i * 0.2}s infinite`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Analysis Results */}
                {analysisResult && !isAnalyzing && (
                    <AnalysisResults analysis={analysisResult.analysis} model={analysisResult.model} />
                )}
            </main>

            {/* Feedback Modal */}
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <RequireAuth>
            <DashboardContent />
        </RequireAuth>
    );
}
