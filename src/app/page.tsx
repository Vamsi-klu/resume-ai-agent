'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { ThemeToggle } from '@/components/ThemeProvider';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '16px 24px',
        background: 'var(--gradient-glass)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{
          maxWidth: 1200,
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
              Resume AI Agent
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 60px',
        background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.1) 0%, transparent 50%)',
      }}>
        <div style={{ maxWidth: 900, textAlign: 'center' }}>
          <div className="animate-slide-up">
            <span className="badge badge-info" style={{ marginBottom: 24 }}>
              ✨ Powered by Google Gemini AI
            </span>
            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
            }}>
              Get Your Resume
              <br />
              <span style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                AI-Optimized
              </span>
            </h1>
            <p style={{
              fontSize: 18,
              color: 'var(--color-text-secondary)',
              maxWidth: 600,
              margin: '0 auto 40px',
              lineHeight: 1.6,
            }}>
              Upload your resume and job description. Our AI analyzes match percentage,
              identifies gaps, and provides actionable recommendations to help you land your dream job.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: 16 }}>
                Start Free Analysis
              </Link>
              <Link href="#features" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: 16 }}>
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 24px', background: 'var(--color-background-secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>
            Powerful Features
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: 60, maxWidth: 600, margin: '0 auto 60px' }}>
            Everything you need to optimize your resume and increase your chances of getting hired.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              {
                icon: '📊',
                title: 'Match Percentage',
                description: 'Get a precise score showing how well your resume matches the job description.',
              },
              {
                icon: '🔍',
                title: 'Gap Analysis',
                description: 'Identify missing keywords, skills, and qualifications that could hurt your chances.',
              },
              {
                icon: '✨',
                title: 'Bullet Improvements',
                description: 'Get specific suggestions to make your experience bullets more impactful.',
              },
              {
                icon: '📚',
                title: 'Learning Resources',
                description: 'Receive personalized course and certification recommendations.',
              },
              {
                icon: '🤖',
                title: 'Multiple AI Models',
                description: 'Choose between Gemini Flash, Pro, or the latest 2.0 for your analysis.',
              },
              {
                icon: '🌙',
                title: 'Dark Mode',
                description: 'Easy on the eyes with full dark mode support and smooth transitions.',
              },
            ].map((feature, i) => (
              <div key={i} className="glass-card" style={{ padding: 28 }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>{feature.icon}</span>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{feature.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 60 }}>
            How It Works
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {[
              { step: 1, title: 'Upload Your Resume', desc: 'Drop your PDF, Word doc, or up to 6 images of your resume.' },
              { step: 2, title: 'Add Job Description', desc: 'Paste the job description you\'re targeting.' },
              { step: 3, title: 'Choose AI Model', desc: 'Select Gemini Flash for speed or Pro for deeper analysis.' },
              { step: 4, title: 'Get Insights', desc: 'Receive comprehensive analysis with actionable improvements.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  background: 'var(--gradient-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{item.title}</h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px',
        background: 'var(--gradient-primary)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: 'white', marginBottom: 16 }}>
          Ready to Optimize Your Resume?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Join thousands of job seekers who have improved their resumes with AI.
        </p>
        <Link
          href="/auth/signup"
          className="btn"
          style={{
            background: 'white',
            color: 'var(--color-primary)',
            padding: '16px 40px',
            fontSize: 16,
          }}
        >
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 24px',
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: 14,
      }}>
        <p>© 2024 Resume AI Agent. Built with ❤️ using Next.js and Google Gemini.</p>
      </footer>
    </div>
  );
}
