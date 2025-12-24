'use client';

interface AnalysisResult {
    matchPercentage: number;
    overallAssessment: string;
    strengths: string[];
    weaknesses: string[];
    missingKeywords: string[];
    missingSkills: string[];
    bulletPointImprovements: Array<{
        original: string;
        improved: string;
        reason: string;
    }>;
    recommendations: string[];
    resources: Array<{
        title: string;
        type: string;
        description: string;
    }>;
    bottlenecks: string[];
    atsScore: number;
    formatSuggestions: string[];
}

interface AnalysisResultsProps {
    analysis: AnalysisResult;
    model: string;
}

export default function AnalysisResults({ analysis, model }: AnalysisResultsProps) {
    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference - (analysis.matchPercentage / 100) * circumference;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 60) return '#22c55e';
        if (score >= 40) return 'var(--color-warning)';
        return 'var(--color-error)';
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Match Score Header */}
            <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
                <div className="match-circle" style={{ margin: '0 auto 24px' }}>
                    <svg viewBox="0 0 160 160">
                        <circle className="match-circle-bg" cx="80" cy="80" r="70" />
                        <circle
                            className="match-circle-progress"
                            cx="80"
                            cy="80"
                            r="70"
                            style={{
                                stroke: getScoreColor(analysis.matchPercentage),
                                strokeDasharray: circumference,
                                strokeDashoffset,
                            }}
                        />
                    </svg>
                    <span className="match-circle-text">{Math.round(analysis.matchPercentage)}%</span>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Resume Match Score</h2>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                    {analysis.overallAssessment}
                </p>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span className="badge badge-info">Model: {model}</span>
                    <span className={`badge ${analysis.atsScore >= 70 ? 'badge-success' : 'badge-warning'}`}>
                        ATS Score: {analysis.atsScore}%
                    </span>
                </div>
            </div>

            {/* Two column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {/* Strengths */}
                <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}>
                        <span style={{ fontSize: 20 }}>💪</span> Strengths
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {analysis.strengths.map((strength, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14 }}>
                                <span style={{ color: 'var(--color-success)', marginTop: 2 }}>✓</span>
                                <span>{strength}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div className="card animate-slide-up" style={{ animationDelay: '150ms' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}>
                        <span style={{ fontSize: 20 }}>⚠️</span> Areas for Improvement
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {analysis.weaknesses.map((weakness, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14 }}>
                                <span style={{ color: 'var(--color-warning)', marginTop: 2 }}>!</span>
                                <span>{weakness}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Missing Skills & Keywords */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                <div className="card animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}>
                        <span style={{ fontSize: 20 }}>🎯</span> Missing Keywords
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {analysis.missingKeywords.map((keyword, i) => (
                            <span
                                key={i}
                                style={{
                                    padding: '6px 12px',
                                    background: 'rgba(239,68,68,0.1)',
                                    color: 'var(--color-error)',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: 13,
                                    fontWeight: 500,
                                }}
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="card animate-slide-up" style={{ animationDelay: '250ms' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}>
                        <span style={{ fontSize: 20 }}>🛠️</span> Missing Skills
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {analysis.missingSkills.map((skill, i) => (
                            <span
                                key={i}
                                style={{
                                    padding: '6px 12px',
                                    background: 'rgba(245,158,11,0.1)',
                                    color: 'var(--color-warning)',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: 13,
                                    fontWeight: 500,
                                }}
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottlenecks */}
            {analysis.bottlenecks.length > 0 && (
                <div className="card animate-slide-up" style={{
                    animationDelay: '300ms',
                    borderColor: 'var(--color-error)',
                    borderWidth: 2,
                }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600, color: 'var(--color-error)' }}>
                        <span style={{ fontSize: 20 }}>🚫</span> Critical Bottlenecks
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {analysis.bottlenecks.map((bottleneck, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14 }}>
                                <span style={{ color: 'var(--color-error)', marginTop: 2 }}>✕</span>
                                <span>{bottleneck}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Bullet Point Improvements */}
            {analysis.bulletPointImprovements.length > 0 && (
                <div className="card animate-slide-up" style={{ animationDelay: '350ms' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}>
                        <span style={{ fontSize: 20 }}>✨</span> Bullet Point Improvements
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {analysis.bulletPointImprovements.map((improvement, i) => (
                            <div key={i} style={{ padding: 16, background: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>ORIGINAL</span>
                                    <p style={{ marginTop: 4, color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>
                                        {improvement.original}
                                    </p>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 500 }}>IMPROVED</span>
                                    <p style={{ marginTop: 4, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                        {improvement.improved}
                                    </p>
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--color-info)', fontStyle: 'italic' }}>
                                    💡 {improvement.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className="card animate-slide-up" style={{ animationDelay: '400ms' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}>
                    <span style={{ fontSize: 20 }}>📋</span> Recommendations
                </h3>
                <ol style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 20 }}>
                    {analysis.recommendations.map((rec, i) => (
                        <li key={i} style={{ fontSize: 14 }}>{rec}</li>
                    ))}
                </ol>
            </div>

            {/* Resources */}
            {analysis.resources.length > 0 && (
                <div className="card animate-slide-up" style={{ animationDelay: '450ms' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}>
                        <span style={{ fontSize: 20 }}>📚</span> Learning Resources
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                        {analysis.resources.map((resource, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: 16,
                                    background: 'var(--color-background-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        background: 'var(--gradient-primary)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                    }}>
                                        {resource.type}
                                    </span>
                                </div>
                                <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{resource.title}</h4>
                                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{resource.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Format Suggestions */}
            {analysis.formatSuggestions.length > 0 && (
                <div className="card animate-slide-up" style={{ animationDelay: '500ms' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}>
                        <span style={{ fontSize: 20 }}>📐</span> Format Suggestions
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {analysis.formatSuggestions.map((suggestion, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14 }}>
                                <span style={{ color: 'var(--color-info)', marginTop: 2 }}>•</span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
