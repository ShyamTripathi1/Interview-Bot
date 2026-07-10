import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, Mic, Video, FileText, 
  HelpCircle, MessageSquare, Star, Zap, Shield,
  ChevronRight, Github
} from 'lucide-react';

const features = [
  {
    icon: '🎙',
    title: 'Voice & Camera Interview',
    desc: 'Real face-to-face AI interviews with live camera, speech recognition, and AI-spoken questions.',
    color: 'var(--accent-indigo)',
    glow: 'rgba(99,102,241,0.3)'
  },
  {
    icon: '🧠',
    title: 'AI Career Coach',
    desc: 'Get instant mentoring on resume writing, negotiation tactics, and behavioral interview strategies.',
    color: 'var(--accent-cyan)',
    glow: 'rgba(6,182,212,0.3)'
  },
  {
    icon: '📊',
    title: 'Technical Quizzes',
    desc: 'Generate custom quizzes for any skill — React, Node, SQL, System Design — and track your growth.',
    color: 'var(--accent-purple)',
    glow: 'rgba(168,85,247,0.3)'
  },
  {
    icon: '📄',
    title: 'Resume Enhancer',
    desc: 'Optimize your resume with AI-powered bullet point rewrites and ATS-friendly keywords.',
    color: 'var(--accent-emerald)',
    glow: 'rgba(16,185,129,0.3)'
  },
];

const steps = [
  { number: '01', title: 'Create an Account', desc: 'Sign up free and set your target role and experience level.' },
  { number: '02', title: 'Choose a Module', desc: 'Pick from Mock Interview, Quiz, Career Chat, or Resume Enhancer.' },
  { number: '03', title: 'Practice & Improve', desc: 'Get instant AI feedback, scoring, and personalized tips every session.' },
];

const stats = [
  { value: '10K+', label: 'Interviews Practiced' },
  { value: '95%', label: 'User Satisfaction' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '50+', label: 'Tech Roles Covered' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-icon" style={{ width: '36px', height: '36px', fontSize: '16px' }}>IB</div>
          <span className="logo-text" style={{ fontSize: '18px' }}>InterviewBot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/login"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '10px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'white'}
            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
          >
            Sign In
          </Link>
          <button className="btn btn-primary" style={{ padding: '9px 20px', fontSize: '14px' }} onClick={() => navigate('/register')}>
            Get Started Free <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="hero-section">
        {/* Glowing orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '8%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <div className="hero-badge">
          <Sparkles size={12} />
          Powered by Gemini AI + Groq
        </div>

        <h1 className="hero-title">
          Ace Your Next Interview
          <br />
          with <span className="gradient-text">AI Coaching</span>
        </h1>

        <p className="hero-subtitle">
          Practice realistic mock interviews with voice & camera, get instant AI feedback, 
          sharpen technical skills, and optimize your resume — all in one platform.
        </p>

        <div className="hero-cta">
          <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }} onClick={() => navigate('/register')}>
            <Zap size={18} /> Start Practicing Free
          </button>
          <button className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: '16px' }} onClick={() => navigate('/login')}>
            Sign In <ChevronRight size={16} />
          </button>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '48px', marginTop: '72px',
          flexWrap: 'wrap', animation: 'fadeInUp 0.5s 0.45s ease both'
        }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Outfit', color: 'white', marginBottom: '4px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', letterSpacing: '0.03em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section style={{ padding: '0 48px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div className="badge badge-indigo" style={{ marginBottom: '16px' }}>
            <Sparkles size={10} /> Everything You Need
          </div>
          <h2 style={{ fontSize: '38px', fontWeight: '800', marginBottom: '14px' }} className="text-gradient">
            Your Complete Interview Prep Suite
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '520px', margin: '0 auto' }}>
            Four powerful AI tools, one platform. No more scattered resources.
          </p>
        </div>

        <div className="features-grid" style={{ padding: '0' }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card"
              style={{ animationDelay: `${i * 0.08}s`, animation: 'fadeInUp 0.5s ease both' }}
            >
              <span className="feature-icon" style={{ filter: `drop-shadow(0 0 14px ${f.glow})` }}>
                {f.icon}
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: 'white' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section className="steps-section">
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '16px' }}>
            Simple Process
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: '800' }} className="text-gradient">
            How It Works
          </h2>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="card step-card" style={{ position: 'relative', padding: '36px 24px' }}>
              <div className="step-number">{s.number}</div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.65' }}>{s.desc}</p>
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', zIndex: 2, display: 'none'
                }}>
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section style={{ padding: '0 48px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(168,85,247,0.10), rgba(6,182,212,0.08))',
          border: '1px solid rgba(99,102,241,0.22)',
          borderRadius: '28px',
          padding: '56px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
            width: '100%', height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--accent-indigo), var(--accent-cyan), var(--accent-purple), transparent)'
          }} />
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '14px' }} className="text-gradient">
            Ready to Land Your Dream Job?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '480px', margin: '0 auto 36px' }}>
            Join thousands of developers who practice smarter with InterviewBot.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '16px' }} onClick={() => navigate('/register')}>
              <Zap size={18} /> Create Free Account
            </button>
            <button className="btn btn-ghost" style={{ padding: '14px 24px', fontSize: '16px' }} onClick={() => navigate('/login')}>
              Already a member? Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-icon" style={{ width: '28px', height: '28px', fontSize: '12px' }}>IB</div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>InterviewBot © 2026 — AI-Powered Interview Prep</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <div className="glow-dot" />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Powered by Gemini AI</span>
        </div>
      </footer>
    </div>
  );
}
