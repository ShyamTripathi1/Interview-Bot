import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  Sparkles, ArrowRight, Award, CheckCircle2,
  HelpCircle, Video, MessageSquare, FileText,
  TrendingUp, Clock, Zap, Target, AlertTriangle, ShieldCheck
} from 'lucide-react';

/* ── Score Ring Component ──────────────────────────────────────── */
const ScoreRing = ({ value, color, bg, size = 120, stroke = 8 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill={bg || "none"} stroke="rgba(0,0,0,0.1)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
};

/* ── Greeting Helper ───────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return '🌅 Good morning';
  if (h < 17) return '☀ Good afternoon';
  return '🌙 Good evening';
};

/* ── History Section (single-tab collapsible) ──────────────────── */
const HistorySection = ({ history, navigate }) => {
  const [showInterviews, setShowInterviews] = useState(false);
  const [showQuizzes, setShowQuizzes] = useState(false);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

      {/* ── Interviews Panel ──────────────────────────────── */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: showInterviews ? '14px' : '0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} style={{ color: '#0052CC' }} /> Recent Interviews
            {history.interviews.length > 0 && (
              <span style={{ background: '#E0EEFF', color: '#003D99', border: '1px solid #0052CC', borderRadius: '99px', fontSize: '11px', fontWeight: '700', padding: '1px 8px' }}>
                {history.interviews.length}
              </span>
            )}
          </h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '4px 10px', border: '1px solid #0052CC', color: '#003D99', fontWeight: '700' }} onClick={() => navigate('/interview')}>
              New <ArrowRight size={11} />
            </button>
            {history.interviews.length > 0 && (
              <button
                onClick={() => setShowInterviews(s => !s)}
                style={{
                  fontSize: '11px', padding: '4px 12px', borderRadius: '99px', cursor: 'pointer', fontWeight: '700',
                  background: showInterviews ? '#E0EEFF' : '#F0F5FF',
                  color: '#003D99',
                  border: '1px solid #0052CC',
                  transition: 'all 0.2s'
                }}
              >
                {showInterviews ? '▲ Hide' : '▼ View All'}
              </button>
            )}
          </div>
        </div>

        {history.interviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: '#003D99', background: '#F0F5FF', border: '1px dashed #0052CC', borderRadius: '8px', marginTop: '10px' }}>
            <Video size={32} style={{ margin: '0 auto 10px', opacity: 0.8, display: 'block', color: '#0052CC' }} />
            <p style={{ fontSize: '14px', fontWeight: '600' }}>No interviews yet</p>
            <p style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>Click "New" to start your first practice!</p>
          </div>
        ) : !showInterviews ? (
          <p style={{ fontSize: '12px', color: '#555', marginTop: '10px', fontWeight: '500' }}>
            Click "View All" to see {history.interviews.length} interview{history.interviews.length > 1 ? 's' : ''}
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.interviews.map(item => (
              <li key={item._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: '10px',
                background: '#FFF9F9', border: '1px solid #FAD4D4'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{item.role}</div>
                  <div style={{ color: '#555', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.status === 'completed' && (item.violationsCount || 0) > 0 && (
                    <span style={{ background: '#FAD4D4', color: '#D93636', border: '1px solid #4A7FBF', padding: '2px 7px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <AlertTriangle size={10} /> {item.violationsCount}
                    </span>
                  )}
                  {item.status === 'completed' && (item.violationsCount || 0) === 0 && (
                    <span style={{ background: '#FAD4D4', color: '#D93636', border: '1px solid #4A7FBF', padding: '2px 7px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ShieldCheck size={10} />
                    </span>
                  )}
                  <span style={{
                    background: item.status === 'completed' ? '#DCE9F7' : 'rgba(245,158,11,0.12)',
                    color: item.status === 'completed' ? '#1D5FA6' : '#fcd34d',
                    border: `1px solid ${item.status === 'completed' ? '#4A7FBF' : 'rgba(245,158,11,0.25)'}`,
                    padding: '2px 9px', borderRadius: '12px', fontSize: '12px', fontWeight: '700'
                  }}>
                    {item.status === 'completed' ? `${item.overallScore}/10` : 'Pending'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Quizzes Panel ─────────────────────────────────── */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: showQuizzes ? '14px' : '0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: '#0052CC' }} /> Recent Quizzes
            {history.quizzes.length > 0 && (
              <span style={{ background: '#E0EEFF', color: '#003D99', border: '1px solid #0052CC', borderRadius: '99px', fontSize: '11px', fontWeight: '700', padding: '1px 8px' }}>
                {history.quizzes.length}
              </span>
            )}
          </h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '4px 10px', border: '1px solid #0052CC', color: '#003D99', fontWeight: '700' }} onClick={() => navigate('/quiz')}>
              New <ArrowRight size={11} />
            </button>
            {history.quizzes.length > 0 && (
              <button
                onClick={() => setShowQuizzes(s => !s)}
                style={{
                  fontSize: '11px', padding: '4px 12px', borderRadius: '99px', cursor: 'pointer', fontWeight: '700',
                  background: showQuizzes ? '#E0EEFF' : '#F0F5FF',
                  color: '#003D99',
                  border: '1px solid #0052CC',
                  transition: 'all 0.2s'
                }}
              >
                {showQuizzes ? '▲ Hide' : '▼ View All'}
              </button>
            )}
          </div>
        </div>

        {history.quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: '#003D99', background: '#F0F5FF', border: '1px dashed #0052CC', borderRadius: '8px', marginTop: '10px' }}>
            <HelpCircle size={32} style={{ margin: '0 auto 10px', opacity: 0.8, display: 'block', color: '#0052CC' }} />
            <p style={{ fontSize: '14px', fontWeight: '600' }}>No quizzes yet</p>
            <p style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>Click "New" to take your first quiz!</p>
          </div>
        ) : !showQuizzes ? (
          <p style={{ fontSize: '12px', color: '#555', marginTop: '10px', fontWeight: '500' }}>
            Click "View All" to see {history.quizzes.length} quiz{history.quizzes.length > 1 ? 'zes' : ''}
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.quizzes.map(item => (
              <li key={item._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: '10px',
                background: '#F5F9FF', border: '1px solid #DCE9F7'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{item.topic}</div>
                  <div style={{ color: '#555', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{ background: '#DCE9F7', color: '#1D5FA6', border: '1px solid #4A7FBF', padding: '2px 9px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                  {item.score}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

const modules = [
  {
    icon: MessageSquare, emoji: '💬',
    title: 'Career AI Coach',
    desc: 'Get AI mentoring on resumes, behavioral interviews, negotiation, and roadmaps.',
    path: '/chat', color: '#FFFFFF', bg: '#E8935C',
    isPrimary: false
  },
  {
    icon: Video, emoji: '🎙',
    title: 'Face-to-Face Interview',
    desc: 'Live AI mock interviews with voice & camera. Scored on the STAR framework.',
    path: '/interview', color: '#FFFFFF', bg: '#E36464',
    isPrimary: true
  },
  {
    icon: HelpCircle, emoji: '📊',
    title: 'Technical Quiz',
    desc: 'Generate quizzes for any skill — React, MongoDB, SQL, System Design & more.',
    path: '/quiz', color: '#FFFFFF', bg: '#4A7FBF',
    isPrimary: false
  },
  {
    icon: FileText, emoji: '📄',
    title: 'Resume Enhancer',
    desc: 'AI-powered bullet point rewrites with ATS-optimized keywords.',
    path: '/resume', color: '#FFFFFF', bg: '#2F5233',
    isPrimary: false
  },
];

export default function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgInterviewScore: 0, interviewsCount: 0,
    quizzesCount: 0, avgQuizScore: 0
  });
  const [history, setHistory] = useState({ interviews: [], quizzes: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const [intRes, quizRes] = await Promise.all([
          fetch((import.meta.env.VITE_API_URL || '') + '/api/interviews', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch((import.meta.env.VITE_API_URL || '') + '/api/quizzes',   { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        const [intData, quizData] = await Promise.all([intRes.json(), quizRes.json()]);

        if (intData.success && quizData.success) {
          const normalizedInts = intData.interviews.map(i => {
            let score = i.overallScore || 0;
            if (score > 10) {
              score = Math.round(score / 10);
            }
            return { ...i, overallScore: score };
          });

          const doneInts  = normalizedInts.filter(i => i.status === 'completed');
          const doneQuiz  = quizData.quizzes.filter(q => q.status === 'completed');
          const avgInt    = doneInts.length  ? Math.round(doneInts.reduce((a,c)  => a + c.overallScore, 0) / doneInts.length)  : 0;
          const avgQuiz   = doneQuiz.length  ? Math.round(doneQuiz.reduce((a,c)  => a + c.score, 0) / doneQuiz.length)         : 0;
          const totalViolations = doneInts.reduce((a, c) => a + (c.violationsCount || 0), 0);
          setStats({ avgInterviewScore: avgInt, interviewsCount: doneInts.length, quizzesCount: doneQuiz.length, avgQuizScore: avgQuiz, totalViolations });
          setHistory({ interviews: normalizedInts.slice(0, 4), quizzes: quizData.quizzes.slice(0, 4) });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  const statCards = [
    { label: 'Avg. Interview Score', value: `${stats.avgInterviewScore}/10`, ringValue: stats.avgInterviewScore * 10, icon: Video,         color: '#4A7FBF', bg: '#DCE9F7', ringColor: '#4A7FBF' },
    { label: 'Interviews Practiced', value: stats.interviewsCount,         ringValue: Math.min(100, stats.interviewsCount * 10), icon: Award,         color: '#4A7FBF', bg: '#DCE9F7', ringColor: '#4A7FBF' },
    { label: 'Integrity Alerts',     value: stats.totalViolations || 0,    ringValue: Math.min(100, (stats.totalViolations || 0) * 20), icon: stats.totalViolations > 0 ? AlertTriangle : ShieldCheck, color: stats.totalViolations > 0 ? '#E36464' : '#4A7FBF', bg: stats.totalViolations > 0 ? '#FBE4E4' : '#DCE9F7', ringColor: stats.totalViolations > 0 ? '#E36464' : '#4A7FBF' },
    { label: 'Technical Quizzes',    value: stats.quizzesCount,            ringValue: Math.min(100, stats.quizzesCount * 10), icon: HelpCircle,    color: '#4A7FBF', bg: '#DCE9F7', ringColor: '#4A7FBF' },
    { label: 'Avg. Quiz Score',      value: `${stats.avgQuizScore}%`,      ringValue: stats.avgQuizScore, icon: CheckCircle2,  color: '#4A7FBF', bg: '#DCE9F7', ringColor: '#4A7FBF' },
  ];

  return (
    <div>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="page-header" style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title"><span style={{ color: '#000000' }}>Hello </span>{user?.name || 'Developer'} 👋</h1>
          <p className="page-subtitle">Track your preparation and launch practice sessions.</p>
        </div>
        <div style={{
          maxWidth: '420px',
          textAlign: 'right',
          fontStyle: 'italic',
          color: 'var(--text-muted)',
          fontSize: '13px',
          fontWeight: '600',
          lineHeight: '1.5',
          opacity: 0.9
        }}>
          "Success in interviews isn't about knowing every answer — it's about proving you can learn any answer."
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="stats-grid">
        {statCards.map((s) => {
          const Icon = s.icon;
          const numVal = parseInt(String(s.value).replace('%', '')) || 0;
          return (
            <div key={s.label} className="card stat-card" style={{ padding: '20px 22px' }}>
              {/* Ring on the left */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <ScoreRing value={s.ringValue !== undefined ? s.ringValue : numVal} color={s.ringColor} bg={s.bg} size={72} stroke={5} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} color={s.color} />
                </div>
              </div>
              <div>
                <div className="stat-number" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modules ──────────────────────────────────────────────── */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Target size={18} style={{ color: 'var(--accent-indigo)' }} /> Preparation Modules
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', marginBottom: '40px' }}>
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="card"
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                minHeight: '210px', cursor: 'pointer'
              }}
              onClick={() => navigate(m.path)}
            >
              <div>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: m.bg || `${m.color}18`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: '14px',
                  boxShadow: m.isPrimary ? `0 0 16px ${m.glow || 'transparent'}` : 'none'
                }}>
                  <Icon size={22} color={m.color} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{m.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>{m.desc}</p>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: 'fit-content', marginTop: '16px', fontSize: '13px', padding: '8px 16px' }}
              >
                {m.isPrimary ? <><Zap size={13} /> Start Now</> : <>Open <ArrowRight size={13} /></>}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── History ──────────────────────────────────────────────── */}
      <HistorySection history={history} navigate={navigate} />
    </div>
  );
}
