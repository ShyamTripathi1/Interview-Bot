import React, { useState } from 'react';
import { useAuth } from '../App';
import { Sparkles, HelpCircle, Award, Check, X, RotateCcw, ArrowRight, BookOpen } from 'lucide-react';

/* ── Score Ring Component ──────────────────────────────────────── */
const ScoreRing = ({ value, color, size = 120, stroke = 8 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 8px ${color})` }}
      />
    </svg>
  );
};

export default function QuizAssessment() {
  const { token } = useAuth();
  
  // Phase state: 'setup' | 'quiz' | 'grading' | 'results'
  const [phase, setPhase] = useState('setup');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quiz running state
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  // Results State
  const [results, setResults] = useState(null);

  const quickTopics = ['React Hooks', 'Node.js & Express', 'System Design', 'SQL & Databases', 'Docker & CI/CD'];

  const handleStart = async (selectedTopic) => {
    const activeTopic = selectedTopic || topic;
    if (!activeTopic.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/quizzes/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: activeTopic })
      });
      const data = await response.json();
      if (data.success) {
        setQuizId(data.quiz._id);
        setQuestions(data.quiz.questions);
        setUserAnswers(new Array(data.quiz.questions.length).fill(-1));
        setPhase('quiz');
        setCurrentIdx(0);
        setTopic(activeTopic);
      } else {
        setError(data.message || 'Failed to generate quiz');
      }
    } catch (err) {
      setError('Could not connect to the backend server');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIdx) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = optIdx;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setPhase('grading');
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quizId,
          userAnswers
        })
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.quiz);
        setPhase('results');
      } else {
        setError(data.message || 'Failed to submit quiz results');
        setPhase('quiz');
      }
    } catch (err) {
      setError('Failed to connect to backend during quiz grading');
      setPhase('quiz');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setPhase('setup');
    setTopic('');
    setQuestions([]);
    setUserAnswers([]);
    setResults(null);
  };

  const progressPct = questions.length ? Math.round(((currentIdx + 1) / questions.length) * 100) : 0;

  return (
    <div>
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Technical Assessment</h1>
          <p className="page-subtitle">Test your skills in specific areas and receive AI improvement tips.</p>
        </div>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(244, 63, 94, 0.08)', 
          border: '1px solid rgba(244, 63, 94, 0.2)', 
          color: '#fda4af', 
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <X size={16} />
          {error}
        </div>
      )}

      {/* SETUP PHASE */}
      {phase === 'setup' && (
        <div className="card" style={{ maxWidth: '580px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={20} style={{ color: 'var(--accent-indigo)' }} />
            Configure Your Quiz
          </h3>
          
          <form onSubmit={(e) => { e.preventDefault(); handleStart(); }}>
            <div className="form-group">
              <label className="form-label">Quiz Topic / Skill Set</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Node.js, SQL, React Hooks, Docker"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <span className="form-label">Or Choose a Popular Skill</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {quickTopics.map(t => (
                  <button
                    key={t}
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--accent-blue)', background: '#FFFFFF', color: 'var(--text-primary)' }}
                    onClick={() => handleStart(t)}
                    disabled={loading}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6' }}>
              Our AI coach will generate an interactive 5-question custom quiz to test your concept limits.
            </p>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '8px' }} />
                  Generating tailored questions...
                </>
              ) : 'Generate Quiz'}
            </button>
          </form>
        </div>
      )}

      {/* QUIZ RUNNING PHASE */}
      {phase === 'quiz' && questions.length > 0 && (
        <div style={{ maxWidth: '780px' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: '20px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span style={{ color: 'var(--accent-indigo)', fontSize: '13px', fontWeight: 'bold' }}>
                Topic: {topic}
              </span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '20px', marginBottom: '24px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              {questions[currentIdx].questionText}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {questions[currentIdx].options.map((opt, idx) => {
                const isSelected = userAnswers[currentIdx] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: '14px',
                      textAlign: 'left',
                      background: isSelected 
                        ? 'rgba(99, 102, 241, 0.12)' 
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected
                        ? '1px solid rgba(99, 102, 241, 0.45)'
                        : '1px solid var(--glass-border)',
                      color: isSelected ? 'white' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: isSelected ? '600' : '400',
                      transition: 'var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }
                    }}
                  >
                    <span style={{ 
                      marginRight: '12px', 
                      color: isSelected ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                      fontWeight: '700',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px'
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ flexGrow: 1 }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} 
                className="btn btn-secondary"
                disabled={currentIdx === 0}
              >
                Previous
              </button>
              <button 
                onClick={handleNext} 
                className="btn btn-primary"
                disabled={userAnswers[currentIdx] === -1}
              >
                {currentIdx === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRADING LOADER */}
      {phase === 'grading' && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '780px' }}>
          <div className="spinner" style={{ margin: '0 auto 24px auto' }}></div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-primary)' }}>Grading Quiz</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Validating answers and fetching review recommendations...</p>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === 'results' && results && (
        <div style={{ maxWidth: '800px' }}>
          {/* Summary Score Card */}
          <div className="card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '32px' }}>
              <div style={{ flex: '1 1 300px' }}>
                <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>
                  <Award size={10} /> Quiz Score Card
                </span>
                <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '14px' }}>Topic: {results.topic}</h2>
                <div style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '14px', 
                  whiteSpace: 'pre-wrap', 
                  borderLeft: '2px solid var(--accent-indigo)', 
                  paddingLeft: '14px',
                  lineHeight: '1.6'
                }}>
                  {results.aiRecommendations}
                </div>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0, margin: '0 auto' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 12px' }}>
                  <ScoreRing value={results.score} color={results.score >= 70 ? 'var(--accent-emerald)' : results.score >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)'} size={120} stroke={7} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#ef4444', lineHeight: 1 }}>
                      {results.score}%
                    </span>
                  </div>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Overall Score</span>
              </div>
            </div>
          </div>

          {/* Breakdown Q&As */}
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--accent-indigo)' }} /> Review Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            {results.questions.map((q, idx) => {
              const isCorrect = q.userAnswerIndex === q.correctOptionIndex;
              return (
                <div key={idx} className="card" style={{ 
                  borderColor: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <h4 style={{ fontSize: '16px', color: 'var(--text-primary)', display: 'flex', gap: '10px', lineHeight: '1.5' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {isCorrect ? <Check size={14} style={{ color: '#10b981' }} /> : <X size={14} style={{ color: '#fb7185' }} />}
                      </span>
                      Question {idx + 1}: {q.questionText}
                    </h4>
                  </div>
                  
                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                    {q.options.map((opt, optIdx) => {
                      const wasSelected = q.userAnswerIndex === optIdx;
                      const isCorrectOpt = q.correctOptionIndex === optIdx;
                      let optionBg = 'rgba(255, 255, 255, 0.01)';
                      let optionBorder = 'rgba(255, 255, 255, 0.03)';
                      let textColor = 'var(--text-secondary)';

                      if (isCorrectOpt) {
                        optionBg = 'rgba(16, 185, 129, 0.06)';
                        optionBorder = 'rgba(16, 185, 129, 0.16)';
                        textColor = '#a7f3d0';
                      } else if (wasSelected && !isCorrectOpt) {
                        optionBg = 'rgba(244, 63, 94, 0.06)';
                        optionBorder = 'rgba(244, 63, 94, 0.16)';
                        textColor = '#fda4af';
                      }

                      return (
                        <div key={optIdx} style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          background: optionBg,
                          border: `1px solid ${optionBorder}`,
                          color: textColor,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          {isCorrectOpt && <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981' }}>Correct</span>}
                          {wasSelected && !isCorrectOpt && <span style={{ fontSize: '11px', fontWeight: '700', color: '#f43f5e' }}>Your Selection</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    padding: '14px',
                    borderRadius: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent-indigo)', fontWeight: 'bold', letterSpacing: '0.04em' }}>
                      EXPLANATION
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.6' }}>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reset actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={resetQuiz} className="btn btn-primary">
              <RotateCcw size={16} /> Take Another Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
