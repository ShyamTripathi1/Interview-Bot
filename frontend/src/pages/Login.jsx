import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';

const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  .login-root {
    --cream-100:#FDF4E7;
    --cream-200:#FCE8CD;
    --cream-300:#F8D7AC;
    --peach-glow:#FDE0BC;
    --card-bg:#FFFFFF;
    --line: rgba(70,40,20,0.12);
    --line-strong: rgba(70,40,20,0.22);
    --ink:#140C05;
    --ink-dim: rgba(20,12,5,0.75);
    --ink-faint: rgba(20,12,5,0.50);
    --amber:#E86A17;
    --amber-deep:#B34700;
    --amber-dim: rgba(232,106,23,0.18);
    --sage:#4A755A;
    --coral:#D9492E;
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    color: var(--ink);
    min-height: 100vh;
    background: var(--cream-100);
    overflow-x: hidden;
  }
  .login-stage {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1.15fr 1fr;
  }
  @media (max-width: 880px) {
    .login-stage { grid-template-columns: 1fr; }
    .login-panel-left { min-height: 44vh; }
    .login-headline { font-size: 32px !important; }
  }
  .login-panel-left {
    position: relative;
    background:
      radial-gradient(760px 520px at 14% 8%, var(--peach-glow), transparent 60%),
      radial-gradient(600px 500px at 100% 100%, rgba(95,138,110,0.12), transparent 62%),
      linear-gradient(165deg, var(--cream-200) 0%, var(--cream-100) 65%);
    border-right: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 52px 56px 36px;
    overflow: hidden;
  }
  .login-rings {
    position: absolute;
    right: -180px; bottom: -180px;
    width: 520px; height: 520px;
    pointer-events: none;
    animation: loginSpin 90s linear infinite;
  }
  .login-rings div {
    position: absolute; inset: 0;
    border: 1px solid var(--line);
    border-radius: 50%;
  }
  .login-rings div:nth-child(2) { inset: 70px; }
  .login-rings div:nth-child(3) { inset: 140px; }
  .login-rings div:nth-child(4) { inset: 210px; border-color: var(--amber-dim); }
  @keyframes loginSpin { to { transform: rotate(360deg); } }

  .login-brand {
    position: relative; z-index: 2;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    letter-spacing: 0.02em;
    color: var(--ink-dim);
    width: 100%;
    max-width: 460px;
    margin: 0 auto;
  }
  .login-brand-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--amber);
    box-shadow: 0 0 0 4px var(--amber-dim);
  }
  .login-hero {
    position: relative; z-index: 2;
    max-width: 460px;
    width: 100%;
    margin: auto;
    padding: 48px 0;
    text-align: center;
  }
  .login-eyebrow-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 0 0 20px;
  }
  .login-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sage);
    margin: 0;
  }
  .login-role-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--amber-deep);
    background: rgba(224,121,44,0.10);
    border: 1px solid var(--amber-dim);
    padding: 3px 9px;
    border-radius: 20px;
    opacity: 0;
    animation: loginChipfade 12s ease-in-out infinite;
  }
  @keyframes loginChipfade {
    0%,100%{ opacity:0; transform:translateY(2px); }
    5%,30%{ opacity:1; transform:translateY(0); }
    35%{ opacity:0; }
  }
  .login-headline {
    font-family: 'Fraunces', serif;
    font-weight: 500;
    font-size: 45px;
    line-height: 1.1;
    letter-spacing: -0.01em;
    margin: 0 0 18px;
    color: var(--ink);
  }
  .login-headline em {
    font-style: italic;
    color: var(--amber-deep);
  }
  .login-sub {
    font-size: 15px;
    line-height: 1.65;
    color: var(--ink-dim);
    max-width: 380px;
    margin: 0 auto;
  }
  .login-transcript {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 36px;
    min-height: 130px;
  }
  .login-line-row {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 12px;
    opacity: 0;
    width: 100%;
    animation: loginRise 12s ease-in-out infinite;
  }
  .login-line-row:nth-child(1) { animation-delay: 0s; }
  .login-line-row:nth-child(2) { animation-delay: 4s; }
  .login-line-row:nth-child(3) { animation-delay: 8s; }
  .login-who {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--ink-faint);
    width: 38px;
    flex-shrink: 0;
    padding-top: 2px;
    text-align: right;
  }
  .login-line-row:nth-child(1) .login-who { color: var(--amber-deep); }
  .login-say {
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-dim);
    max-width: 340px;
    text-align: left;
  }
  .login-bars {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 16px;
    margin-top: 4px;
    flex-shrink: 0;
  }
  .login-bars span {
    width: 3px;
    background: var(--sage);
    border-radius: 2px;
    animation: loginBounce 1.1s ease-in-out infinite;
  }
  .login-line-row:nth-child(1) .login-bars span { background: var(--amber); }
  .login-bars span:nth-child(1){ height: 40%; animation-delay: 0.0s; }
  .login-bars span:nth-child(2){ height: 80%; animation-delay: 0.1s; }
  .login-bars span:nth-child(3){ height: 55%; animation-delay: 0.2s; }
  .login-bars span:nth-child(4){ height: 100%; animation-delay: 0.3s; }
  .login-bars span:nth-child(5){ height: 65%; animation-delay: 0.4s; }
  @keyframes loginBounce {
    0%,100%{ transform: scaleY(0.45); }
    50%{ transform: scaleY(1); }
  }
  @keyframes loginRise {
    0%{ opacity:0; transform:translateY(8px); }
    6%{ opacity:1; transform:translateY(0); }
    28%{ opacity:1; }
    36%{ opacity:0; }
    100%{ opacity:0; }
  }
  .login-foot {
    position: relative; z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    max-width: 460px;
    margin: 0 auto;
    font-size: 12px;
    color: var(--ink-faint);
    border-top: 1px solid var(--line);
    padding-top: 20px;
  }
  .login-foot-rec {
    display: flex; align-items: center; gap: 8px;
    font-family: 'JetBrains Mono', monospace;
  }
  .login-foot-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--coral);
    animation: loginBlink 1.6s ease-in-out infinite;
  }
  @keyframes loginBlink { 0%,100%{ opacity:1; } 50%{ opacity:0.25; } }
  .login-clock { font-family: 'JetBrains Mono', monospace; }

  .login-panel-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 48px;
    background:
      radial-gradient(500px 400px at 50% 0%, rgba(224,121,44,0.05), transparent 60%),
      var(--cream-100);
  }
  .login-card {
    width: 100%;
    max-width: 380px;
    background: var(--card-bg);
    border-radius: 20px;
    padding: 36px 34px;
    box-shadow: 0 1px 2px rgba(90,60,30,0.04), 0 20px 44px rgba(90,60,30,0.10);
    border: 1px solid rgba(90,60,30,0.06);
    animation: loginCardin 0.6s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes loginCardin {
    from{ opacity:0; transform:translateY(10px); }
    to{ opacity:1; transform:translateY(0); }
  }
  .login-card-head { margin-bottom: 26px; }
  .login-card-head h2 {
    font-family: 'Fraunces', serif;
    font-weight: 500;
    font-size: 27px;
    margin: 0 0 8px;
    color: var(--ink);
  }
  .login-card-head p { font-size: 14px; color: var(--ink-dim); margin: 0; }
  .login-card-head p a { color: var(--amber-deep); text-decoration: none; border-bottom: 1px solid var(--amber-dim); }
  .login-card-head p a:hover { border-color: var(--amber-deep); }

  .login-field { margin-bottom: 17px; }
  .login-field label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 7px;
    letter-spacing: 0.02em;
  }
  .login-input-wrap { position: relative; }
  .login-input-wrap svg {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    opacity: 0.4;
    pointer-events: none;
  }
  .login-field input {
    width: 100%;
    height: 44px;
    padding: 0 14px 0 40px;
    background: #FBF7EF;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    color: var(--ink);
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }
  .login-field input::placeholder { color: var(--ink-faint); }
  .login-field input:hover { border-color: var(--amber-dim); }
  .login-field input:focus {
    border-color: var(--amber);
    box-shadow: 0 0 0 3px var(--amber-dim);
    background: #FFFFFF;
  }
  .login-toggle-pw {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: var(--ink-faint);
    cursor: pointer;
    padding: 4px;
    display: flex;
    transition: color 0.15s ease;
  }
  .login-toggle-pw:hover { color: var(--ink-dim); }

  .login-error-box {
    background: rgba(217,87,63,0.08);
    border: 1px solid rgba(217,87,63,0.2);
    color: var(--coral);
    padding: 11px 14px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 18px;
  }

  .login-btn-primary {
    width: 100%;
    height: 46px;
    border: none;
    border-radius: 23px;
    background: linear-gradient(180deg, var(--amber) 0%, var(--amber-deep) 100%);
    color: #FFF8EE;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: transform 0.12s ease, filter 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 8px 20px rgba(193,90,30,0.28);
    margin-top: 4px;
  }
  .login-btn-primary:hover { filter: brightness(1.05); }
  .login-btn-primary:active { transform: scale(0.98); }
  .login-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

  .login-card-foot {
    margin-top: 24px;
    text-align: center;
    font-size: 13px;
    color: var(--ink-dim);
  }
  .login-card-foot a { color: var(--amber-deep); text-decoration: none; border-bottom: 1px solid var(--amber-dim); }
  .login-card-foot a:hover { border-color: var(--amber-deep); }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(252);
  const [users, setUsers] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/users');
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleQuickLogin = async (selectedEmail) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/login-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedEmail })
      });
      const data = await response.json();
      if (data.success) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Quick login failed');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatClock = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `session ${m}:${sec}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <style>{loginStyles}</style>
      <div className="login-stage">

        {/* ── Left Panel ── */}
        <div className="login-panel-left">
          <div className="login-rings" aria-hidden="true">
            <div /><div /><div /><div />
          </div>

          <div className="login-brand">
            <span className="login-brand-dot" aria-hidden="true" />
            Interview Bot
          </div>

          <div className="login-hero">
            <div className="login-eyebrow-row">
              <p className="login-eyebrow">mock interview, live</p>
              <span className="login-role-chip" aria-hidden="true">practicing: product manager</span>
            </div>
            <h1 className="login-headline">
              Practice the answer<br /><em>before</em> it counts.
            </h1>
            <p className="login-sub">
              Your AI interviewer listens, follows up, and tells you exactly where the answer got vague.
            </p>

            <div className="login-transcript" aria-hidden="true">
              <div className="login-line-row">
                <span className="login-who">bot</span>
                <span className="login-say">"Walk me through a time you disagreed with a decision."</span>
              </div>
              <div className="login-line-row">
                <span className="login-who">you</span>
                <div className="login-bars">
                  <span /><span /><span /><span /><span />
                </div>
              </div>
              <div className="login-line-row">
                <span className="login-who">bot</span>
                <span className="login-say">"Good — now tell me what changed after that conversation."</span>
              </div>
            </div>
          </div>

          <div className="login-foot">
            <span className="login-clock">{formatClock(seconds)}</span>
            <span className="login-foot-rec">
              <span className="login-foot-dot" aria-hidden="true" />
              listening
            </span>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="login-panel-right">
          <div className="login-card">
            <div className="login-card-head">
              <h2>Welcome back</h2>
              <p>New here? <Link to="/register">Start a free mock interview</Link></p>
            </div>

            {error && <div className="login-error-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">Email</label>
                <div className="login-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 6h18v12H3z"/><path d="M3 6l9 7 9-7"/>
                  </svg>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <div className="login-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-toggle-pw"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-7-11-7a20.4 20.4 0 0 1 4.22-5.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a20.4 20.4 0 0 1-2.16 3.19"/>
                        <path d="M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-btn-primary"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="login-card-foot">
              Don't have an account? <Link to="/register">Sign up</Link>
            </div>

            {users.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--ink-dim)', marginBottom: '8px', textAlign: 'center' }}>
                  Quick Sign-In (Select Account)
                </label>
                <select 
                  onChange={(e) => { if (e.target.value) handleQuickLogin(e.target.value); }}
                  defaultValue=""
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#FFF9F4',
                    border: '1px solid rgba(232, 106, 23, 0.25)',
                    borderRadius: '8px',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="" disabled>Choose an account to sign in...</option>
                  {users.map(u => (
                    <option key={u.email} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
