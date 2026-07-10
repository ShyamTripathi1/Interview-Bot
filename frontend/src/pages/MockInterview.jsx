import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../App';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight,
  Award,
  RotateCcw,
  CheckCircle,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  Star,
  TrendingUp,
  MessageCircle
} from 'lucide-react';

// ─── AI Interviewer Avatar ────────────────────────────────────────────────────
const AIAvatar = ({ isSpeaking }) => (
  <div className="ai-avatar-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div
      className={`ai-avatar-ring ${isSpeaking ? 'ai-speaking' : ''}`}
      style={{
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        padding: '3px',
        background: isSpeaking
          ? 'linear-gradient(135deg, #06b6d4, #6366f1, #a855f7)'
          : 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.4))',
        animation: isSpeaking ? 'avatarPulse 1.5s ease-in-out infinite' : 'none',
        transition: 'all 0.3s ease',
        boxShadow: isSpeaking ? '0 0 30px rgba(6,182,212,0.5)' : '0 0 20px rgba(99,102,241,0.3)',
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1b1e36, #111428)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '36px',
        userSelect: 'none',
      }}>
        🤖
      </div>
    </div>
    <div style={{
      marginTop: '8px',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.08em',
      color: isSpeaking ? '#06b6d4' : 'var(--text-secondary)',
      textTransform: 'uppercase',
      transition: 'color 0.3s'
    }}>
      {isSpeaking ? '● Speaking...' : 'AI Interviewer'}
    </div>
  </div>
);

// ─── Audio Visualizer Bars ────────────────────────────────────────────────────
const AudioVisualizer = ({ isActive, color = '#06b6d4', barCount = 20 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', height: '40px' }}>
    {Array.from({ length: barCount }).map((_, i) => (
      <div
        key={i}
        style={{
          width: '3px',
          borderRadius: '2px',
          background: isActive
            ? `linear-gradient(to top, ${color}, rgba(255,255,255,0.3))`
            : 'rgba(255,255,255,0.1)',
          height: isActive ? `${Math.random() * 28 + 8}px` : '6px',
          animation: isActive ? `barPulse ${0.5 + (i % 5) * 0.1}s ease-in-out infinite alternate` : 'none',
          animationDelay: `${i * 0.04}s`,
          transition: 'background 0.3s',
        }}
      />
    ))}
  </div>
);

// ─── Camera Feed Component ────────────────────────────────────────────────────
const CameraFeed = ({ videoRef, isActive, isMirror = true }) => (
  <div style={{
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    background: 'transparent',
    borderRadius: '16px',
    overflow: 'hidden',
    border: isActive ? '2px solid rgba(6,182,212,0.4)' : '2px solid rgba(239,68,68,0.5)',
    boxShadow: isActive ? '0 0 20px rgba(6,182,212,0.15)' : '0 0 20px rgba(239,68,68,0.15)',
    transition: 'all 0.4s ease',
  }}>
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: isMirror ? 'scaleX(-1)' : 'none',
        display: isActive ? 'block' : 'none',
        borderRadius: '14px',
      }}
    />
    {!isActive && (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#dc2626',
        background: 'rgba(239,68,68,0.05)',
        padding: '20px',
        textAlign: 'center'
      }}>
        <CameraOff size={36} style={{ color: '#ef4444' }} />
        <span style={{ fontSize: '14px', fontWeight: '700' }}>⚠️ Camera is off!</span>
        <span style={{ fontSize: '13px', color: '#444444', maxWidth: '200px' }}>
          Please enable your camera to continue the proctored interview.
        </span>
      </div>
    )}
    {isActive && (
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(239,68,68,0.85)',
        color: 'white',
        borderRadius: '6px',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        backdropFilter: 'blur(4px)',
      }}>
        <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', animation: 'blink 1s ease infinite' }} />
        LIVE
      </div>
    )}
  </div>
);

// ─── Question Timer ────────────────────────────────────────────────────────────
const QuestionTimer = ({ seconds }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isWarning = seconds < 30;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: isWarning ? '#ef4444' : 'var(--text-secondary)',
      fontSize: '14px',
      fontWeight: '600',
      fontFamily: 'monospace',
      transition: 'color 0.3s',
    }}>
      <Clock size={14} style={{ animation: isWarning ? 'blink 1s ease infinite' : 'none' }} />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MockInterview() {
  const { token } = useAuth();

  // Phase state
  const [phase, setPhase] = useState('setup'); // setup | interview | grading | results
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Interview data
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [results, setResults] = useState(null);

  // Camera state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Voice / Speech
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceRef = useRef(null);

  // Timer
  const [timer, setTimer] = useState(120); // 2 min per question
  const timerRef = useRef(null);

  // ── Camera Helpers ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera access in browser settings.');
      setCameraOn(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  const toggleCamera = () => {
    cameraOn ? stopCamera() : startCamera();
  };

  const captureSnapshot = useCallback(() => {
    if (videoRef.current && cameraOn) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        // Don't mirror the proctoring snapshot — capture the real view
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.5);
      } catch (err) {
        console.error("Failed to capture snapshot:", err);
        return 'camera_off';
      }
    }
    return 'camera_off';
  }, [cameraOn]);

  const captureAndSaveSnapshot = useCallback(() => {
    const snap = captureSnapshot();
    setSnapshots(prev => {
      const updated = [...prev];
      updated[currentIdx] = snap;
      return updated;
    });
    // Return the updated snapshot array locally for immediate sync submit
    const updatedLocal = [...snapshots];
    updatedLocal[currentIdx] = snap;
    return updatedLocal;
  }, [captureSnapshot, currentIdx, snapshots]);

  // ── Periodic proctoring snapshot capture (every 10 seconds during interview) ──
  const proctoringIntervalRef = useRef(null);
  useEffect(() => {
    if (phase === 'interview' && cameraOn) {
      // Capture a snapshot immediately when question changes or camera turns on
      const snap = captureSnapshot();
      if (snap !== 'camera_off') {
        setSnapshots(prev => {
          const updated = [...prev];
          updated[currentIdx] = snap;
          return updated;
        });
      }
      // Then capture periodically
      proctoringIntervalRef.current = setInterval(() => {
        const periodicSnap = captureSnapshot();
        if (periodicSnap !== 'camera_off') {
          setSnapshots(prev => {
            const updated = [...prev];
            updated[currentIdx] = periodicSnap;
            return updated;
          });
        }
      }, 10000); // Every 10 seconds
    }
    return () => {
      if (proctoringIntervalRef.current) {
        clearInterval(proctoringIntervalRef.current);
        proctoringIntervalRef.current = null;
      }
    };
  }, [phase, cameraOn, currentIdx, captureSnapshot]);

  // Cleanup camera on unmount or phase change
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // ── Timer Helpers ───────────────────────────────────────────────────────────
  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimer(120);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 && !voiceRef.current) {
        const malePatterns = ['david', 'mark', 'alex', 'george', 'ravi', 'male', 'natural (male)', 'guy'];
        let foundVoice = null;
        for (const pattern of malePatterns) {
          foundVoice = voices.find(v => v.name.toLowerCase().includes(pattern));
          if (foundVoice) break;
        }
        if (!foundVoice) {
          foundVoice = voices.find(v => v.default) || voices[0];
        }
        voiceRef.current = foundVoice;
      }
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      handleVoicesChanged();
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      }
    };
  }, []);

  // ── Voice Helpers ────────────────────────────────────────────────────────────
  const speakQuestion = useCallback((text) => {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    } else {
      const voices = window.speechSynthesis.getVoices();
      const malePatterns = ['david', 'mark', 'alex', 'george', 'ravi', 'male', 'natural (male)', 'guy'];
      let foundVoice = null;
      for (const pattern of malePatterns) {
        foundVoice = voices.find(v => v.name.toLowerCase().includes(pattern));
        if (foundVoice) break;
      }
      if (!foundVoice && voices.length > 0) {
        foundVoice = voices.find(v => v.default) || voices[0];
      }
      if (foundVoice) {
        voiceRef.current = foundVoice;
        utterance.voice = foundVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your response.');
      return;
    }
    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join('');
        setCurrentAnswer(transcript);
      };
      rec.onend = () => setIsRecording(false);
      rec.onerror = () => setIsRecording(false);
      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  };

  const toggleRecording = () => isRecording ? stopRecording() : startRecording();

  // ── Interview Flow ──────────────────────────────────────────────────────────
  const handleStart = async (e) => {
    e.preventDefault();
    if (!role.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/interviews/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role, jobDescription })
      });
      const data = await res.json();
      if (data.success) {
        const qList = data.interview.questions.map(q => q.questionText);
        setInterviewId(data.interview._id);
        setQuestions(qList);
        setAnswers(new Array(qList.length).fill(''));
        setSnapshots(new Array(qList.length).fill(''));
        setCurrentIdx(0);
        setCurrentAnswer('');
        setPhase('interview');
        await startCamera();
        resetTimer();
        // Small delay to let speech synthesis load voices
        setTimeout(() => speakQuestion(qList[0]), 600);
      } else {
        setError(data.message || 'Failed to start interview session.');
      }
    } catch {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentAnswer = () => {
    const updated = [...answers];
    updated[currentIdx] = currentAnswer;
    setAnswers(updated);
    return updated;
  };

  const handleNext = () => {
    stopRecording();
    const updatedAnswers = saveCurrentAnswer();
    const updatedSnaps = captureAndSaveSnapshot();
    if (currentIdx < questions.length - 1) {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      setCurrentAnswer(updatedAnswers[next] || '');
      resetTimer();
      setTimeout(() => speakQuestion(questions[next]), 300);
    } else {
      setPhase('grading');
      stopCamera();
      handleSubmit(updatedAnswers, updatedSnaps);
    }
  };

  const handlePrev = () => {
    stopRecording();
    const updatedAnswers = saveCurrentAnswer();
    captureAndSaveSnapshot();
    if (currentIdx > 0) {
      const prev = currentIdx - 1;
      setCurrentIdx(prev);
      setCurrentAnswer(updatedAnswers[prev] || '');
      resetTimer();
      setTimeout(() => speakQuestion(questions[prev]), 300);
    }
  };

  const handleSubmit = async (finalAnswers, finalSnapshots) => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/interviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ interviewId, answers: finalAnswers, snapshots: finalSnapshots })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.interview);
        setPhase('results');
      } else {
        setError(data.message || 'Failed to submit answers for grading.');
        setPhase('interview');
      }
    } catch {
      setError('Failed to connect to backend during grading.');
      setPhase('interview');
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    stopCamera();
    stopRecording();
    window.speechSynthesis.cancel();
    clearInterval(timerRef.current);
    if (proctoringIntervalRef.current) {
      clearInterval(proctoringIntervalRef.current);
      proctoringIntervalRef.current = null;
    }
    setPhase('setup');
    setRole('');
    setJobDescription('');
    setQuestions([]);
    setAnswers([]);
    setSnapshots([]);
    setResults(null);
    setCurrentIdx(0);
    setCurrentAnswer('');
    setError('');
    setTimer(120);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (!next && phase === 'interview') {
      setTimeout(() => speakQuestion(questions[currentIdx]), 100);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', paddingBottom: '80px' }}>
      
      {/* Floating Header */}
      <div className="page-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'transparent',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '20px',
        margin: '-32px -32px 32px -32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Face-to-Face AI Interview</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>Real-time voice & camera interview. Speak naturally — just like the real thing.</p>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          color: '#f87171', padding: '14px 18px', borderRadius: '10px', marginBottom: '24px',
          fontSize: '14px'
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── SETUP PHASE ─────────────────────────────────────────────── */}
      {phase === 'setup' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Form */}
          <div className="card">
            <h3 style={{ fontSize: '20px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={20} style={{ color: 'var(--accent-indigo)' }} />
              Configure Your Interview
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
              Set up your interview session. Your camera and microphone will be activated once started.
            </p>
            <form onSubmit={handleStart}>
              <div className="form-group">
                <label className="form-label">Job Role / Target Position *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Frontend Engineer, Data Scientist"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Job Description (Optional)</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Paste requirements to generate tailored questions..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? (
                  <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', margin: 0 }} /> Generating Questions...</>
                ) : (
                  <><Camera size={16} /> Start Interview Session</>
                )}
              </button>
            </form>
          </div>

          {/* Preview + Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Camera Preview */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>CAMERA PREVIEW</h4>
                <button
                  onClick={toggleCamera}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '12px', gap: '6px' }}
                >
                  {cameraOn ? <><CameraOff size={14} /> Turn Off</> : <><Camera size={14} /> Test Camera</>}
                </button>
              </div>
              <CameraFeed videoRef={videoRef} isActive={cameraOn} />
              {cameraError && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '8px' }}>⚠ {cameraError}</p>}
            </div>

            {/* Feature chips */}
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>SESSION FEATURES</h4>
              {[
                { icon: '🎙', label: 'Voice Recognition', desc: 'Speak your answers aloud' },
                { icon: '📹', label: 'Live Camera Feed', desc: 'Practice your body language' },
                { icon: '🔊', label: 'AI Voice Questions', desc: 'Interviewer speaks each question' },
                { icon: '⏱', label: 'Timed Responses', desc: '2 minutes per question' },
                { icon: '🧠', label: 'AI Evaluation', desc: 'Instant STAR framework scoring' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{f.label}</div>
                    <div style={{ fontSize: '13px', color: '#333333', marginTop: '2px' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INTERVIEW PHASE ──────────────────────────────────────────── */}
      {phase === 'interview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Progress Bar */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', height: '6px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-cyan))',
              borderRadius: '8px',
              transition: 'width 0.5s ease',
              boxShadow: '0 0 10px rgba(99,102,241,0.4)'
            }} />
          </div>

          {/* Main Interview Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* LEFT: AI Interviewer Panel */}
            <div className="card" style={{
              background: 'transparent',
              display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--accent-indigo)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AI Interviewer
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <QuestionTimer seconds={timer} />
                  <button
                    onClick={toggleMute}
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '11px' }}
                    title={isMuted ? 'Unmute AI' : 'Mute AI'}
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
              </div>

              {/* AI Avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
                <AIAvatar isSpeaking={isSpeaking} />
                {/* AI voice wave */}
                <div style={{ marginTop: '16px', width: '100%' }}>
                  <AudioVisualizer isActive={isSpeaking} color="#06b6d4" barCount={18} />
                </div>
              </div>

              {/* Question bubble */}
              <div style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '16px',
                borderTopLeftRadius: '4px',
                padding: '18px',
                position: 'relative',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-indigo)', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Question {currentIdx + 1} / {questions.length}
                </div>
                <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.65' }}>
                  {questions[currentIdx]}
                </p>
                <button
                  onClick={() => speakQuestion(questions[currentIdx])}
                  style={{
                    marginTop: '14px',
                    background: 'transparent',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: 'var(--accent-indigo)',
                    borderRadius: '8px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Volume2 size={12} /> Replay Question
                </button>
              </div>

              {/* STAR tips */}
              <div style={{ background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} /> STAR Framework Tips
                </div>
                {['Situation — Set the scene', 'Task — Describe the challenge', 'Action — What did you do?', 'Result — What was the outcome?'].map((t, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#444444', padding: '2px 0' }}>
                    • {t}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: User Camera + Answer Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Camera */}
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Your Camera
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Mic toggle */}
                    <button
                      onClick={toggleRecording}
                      className="btn"
                      style={{
                        padding: '5px 12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: isRecording
                          ? 'rgba(239,68,68,0.15)'
                          : 'rgba(239,68,68,0.85)',
                        border: isRecording
                          ? '1px solid rgba(220,38,38,0.5)'
                          : '1px solid transparent',
                        color: isRecording ? '#dc2626' : 'white',
                        borderRadius: '6px',
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      {isRecording ? <><MicOff size={13} /> Stop</> : <><Mic size={13} /> Speak</>}
                    </button>
                    {/* Camera toggle */}
                    <button
                      onClick={toggleCamera}
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '11px' }}
                      title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
                    >
                      {cameraOn ? <VideoOff size={13} /> : <Video size={13} />}
                    </button>
                  </div>
                </div>

                <CameraFeed videoRef={videoRef} isActive={cameraOn} />

                {/* User mic visualizer */}
                <div style={{ marginTop: '10px' }}>
                  <AudioVisualizer isActive={isRecording} color="#a855f7" barCount={16} />
                  <div style={{ textAlign: 'center', fontSize: '11px', color: isRecording ? '#a855f7' : 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>
                    {isRecording ? '● Recording your voice...' : 'Microphone idle'}
                  </div>
                </div>
              </div>

              {/* Answer textarea */}
              <div className="card" style={{ padding: '16px', flexGrow: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                  Your Response
                </label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Speak your answer using the mic, or type it here..."
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '110px', fontSize: '14px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', gap: '10px' }}>
                  <button
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="btn btn-secondary"
                    style={{ padding: '9px 18px', fontSize: '13px' }}
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>
                  <button
                    onClick={handleNext}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {currentIdx === questions.length - 1
                      ? <><CheckCircle size={15} /> Finish & Grade</>
                      : <><ChevronRight size={15} /> Next Question</>
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Question nav dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', paddingTop: '4px' }}>
            {questions.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: i === currentIdx
                    ? 'var(--accent-indigo)'
                    : answers[i]
                      ? 'rgba(16,185,129,0.6)'
                      : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s',
                  boxShadow: i === currentIdx ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
                }}
                title={`Question ${i + 1}${answers[i] ? ' (answered)' : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── GRADING PHASE ────────────────────────────────────────────── */}
      {phase === 'grading' && (
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '28px' }}>
            <div className="spinner" style={{ width: '60px', height: '60px', borderWidth: '3px' }} />
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🤖</span>
          </div>
          <h2 style={{ fontSize: '26px', marginBottom: '10px' }}>Evaluating Your Performance</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            Our AI is analyzing your responses for clarity, structure, and technical depth...
          </p>
        </div>
      )}

      {/* ── RESULTS PHASE ────────────────────────────────────────────── */}
      {phase === 'results' && results && (
        <div>
          {/* Score Header */}
          <div className="card" style={{
            marginBottom: '28px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
            border: '1px solid rgba(99,102,241,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--accent-indigo)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Interview Complete
                </span>
                <h2 style={{ fontSize: '28px', margin: '6px 0 10px' }}>
                  {results.role} — Session Report
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', fontSize: '15px', lineHeight: '1.7' }}>
                  {results.overallFeedback}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexShrink: 0 }}>
                {/* Violations Count Card */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '110px', height: '110px', borderRadius: '50%',
                    border: '5px solid #dc2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column',
                    background: 'rgba(220,38,38,0.08)',
                    boxShadow: '0 0 30px rgba(220,38,38,0.15)',
                    margin: '0 auto 8px'
                  }}>
                    <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>{results.violationsCount || 0}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    Integrity Alerts
                  </div>
                </div>

                {/* Score ring */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '110px', height: '110px', borderRadius: '50%',
                    border: `5px solid ${results.overallScore >= 7 ? 'var(--accent-success)' : '#f59e0b'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column',
                    background: results.overallScore >= 7 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                    boxShadow: results.overallScore >= 7 ? '0 0 30px rgba(16,185,129,0.2)' : '0 0 30px rgba(245,158,11,0.2)',
                    margin: '0 auto 8px'
                  }}>
                    <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>{results.overallScore}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>/10</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    <Star size={12} /> Overall Score
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proctoring Violations Details */}
          {results.violations && results.violations.length > 0 && (
            <div className="card" style={{ marginBottom: '28px', borderLeft: '4px solid #ef4444', background: 'rgba(239,68,68,0.02)', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', color: '#f87171', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Proctoring Violations Log
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {results.violations.map((v, idx) => (
                  <div key={idx} style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '4px', padding: '1px 6px', fontWeight: '700', fontSize: '11px', flexShrink: 0 }}>
                      Q{v.questionIndex + 1}
                    </span>
                    <div>
                      <strong style={{ textTransform: 'capitalize', color: 'white' }}>{v.type.replace('_', ' ')}:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{v.details}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Q&A Breakdown */}
          <h3 style={{ fontSize: '20px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-indigo)' }} /> Question Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {results.questions.map((q, idx) => {
              const scoreColor = q.score >= 8 ? '#10b981' : q.score >= 6 ? '#f59e0b' : '#ef4444';
              return (
                <div key={idx} className="card" style={{ borderLeft: `3px solid ${scoreColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                      <span style={{
                        background: 'rgba(99,102,241,0.15)',
                        color: 'var(--accent-indigo)',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: '700',
                        flexShrink: 0
                      }}>
                        Q{idx + 1}
                      </span>
                      <h4 style={{ fontSize: '15px', color: 'white', lineHeight: '1.5' }}>{q.questionText}</h4>
                    </div>
                    <div style={{
                      background: `${scoreColor}18`,
                      color: scoreColor,
                      border: `1px solid ${scoreColor}40`,
                      borderRadius: '20px',
                      padding: '4px 14px',
                      fontSize: '14px',
                      fontWeight: '800',
                      flexShrink: 0
                    }}>
                      {q.score}/10
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageCircle size={10} /> Your Answer
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: '1.6' }}>
                        "{q.userAnswer || 'No answer submitted.'}"
                      </p>
                    </div>
                    <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(99,102,241,0.12)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--accent-indigo)', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={10} /> AI Feedback
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{q.feedback}</p>
                    </div>
                  </div>
                  {results.violations && results.violations.filter(v => v.questionIndex === idx).length > 0 && (
                    <div style={{ marginTop: '12px', background: 'rgba(239,68,68,0.06)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⚠️ Proctoring Violations
                      </div>
                      {results.violations.filter(v => v.questionIndex === idx).map((v, vIdx) => (
                        <p key={vIdx} style={{ fontSize: '13px', color: '#f87171', lineHeight: '1.6', margin: '4px 0 0 0' }}>
                          <strong style={{ textTransform: 'capitalize' }}>{v.type.replace('_', ' ')}:</strong> {v.details}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={resetInterview} className="btn btn-primary">
              <RotateCcw size={16} /> Take Another Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
