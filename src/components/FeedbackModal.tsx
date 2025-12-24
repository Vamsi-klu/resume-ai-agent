'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const { token } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [category, setCategory] = useState('suggestion');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (message.length < 10) {
            setError('Please provide more details (at least 10 characters)');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rating, category, message }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit feedback');
            }

            setSubmitted(true);
            setTimeout(() => {
                onClose();
                // Reset form
                setRating(0);
                setCategory('suggestion');
                setMessage('');
                setSubmitted(false);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = [
        { value: 'suggestion', label: '💡 Suggestion', description: 'Ideas for improvement' },
        { value: 'feature', label: '✨ Feature Request', description: 'New functionality' },
        { value: 'bug', label: '🐛 Bug Report', description: 'Something not working' },
        { value: 'other', label: '💬 Other', description: 'General feedback' },
    ];

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div style={{ padding: 24 }}>
                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }} className="animate-fade-in">
                            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Thank you!</h2>
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                Your feedback helps us improve Resume AI Agent.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Share Your Feedback</h2>
                                <button
                                    onClick={onClose}
                                    className="btn-ghost"
                                    style={{ width: 32, height: 32, borderRadius: '50%', padding: 0, fontSize: 18 }}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Rating */}
                                <div style={{ marginBottom: 24, textAlign: 'center' }}>
                                    <p style={{ marginBottom: 12, color: 'var(--color-text-secondary)', fontSize: 14 }}>
                                        How would you rate your experience?
                                    </p>
                                    <div className="star-rating" style={{ justifyContent: 'center' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={star <= (hoveredRating || rating) ? 'active' : ''}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                onClick={() => setRating(star)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category */}
                                <div style={{ marginBottom: 24 }}>
                                    <p style={{ marginBottom: 12, color: 'var(--color-text-secondary)', fontSize: 14 }}>
                                        What type of feedback?
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setCategory(cat.value)}
                                                style={{
                                                    padding: '12px 16px',
                                                    background: category === cat.value ? 'var(--color-primary)' : 'var(--color-background-secondary)',
                                                    color: category === cat.value ? 'white' : 'var(--color-text-primary)',
                                                    border: '1px solid',
                                                    borderColor: category === cat.value ? 'var(--color-primary)' : 'var(--color-border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    cursor: 'pointer',
                                                    transition: 'all var(--transition-fast)',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <span style={{ display: 'block', fontWeight: 500 }}>{cat.label}</span>
                                                <span style={{ fontSize: 11, opacity: 0.8 }}>{cat.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="input-group" style={{ marginBottom: 24 }}>
                                    <label className="input-label">Your feedback</label>
                                    <textarea
                                        className="input"
                                        rows={4}
                                        placeholder="Tell us what's on your mind..."
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        style={{ resize: 'vertical', minHeight: 100 }}
                                    />
                                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'right' }}>
                                        {message.length}/2000
                                    </span>
                                </div>

                                {error && (
                                    <div style={{
                                        marginBottom: 16,
                                        padding: 12,
                                        background: 'rgba(239,68,68,0.1)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-error)',
                                        fontSize: 14,
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={onClose}
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                        style={{ flex: 1 }}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
