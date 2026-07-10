import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { Send, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';

export default function CareerChat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: "Hello! I am your InterviewBot Career Coach. I can help you review your resume, practice behavior questions, prepare system design roadmaps, or give negotiation tips. How can I help you accelerate your career today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const presets = [
    "Give me tips on how to prepare for a System Design interview",
    "How can I structure behavioral answers using the STAR method?",
    "What are key questions to ask the interviewer at the end?",
    "Review standard negotiation strategies for tech offers"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    if (!messageText) setInput('');

    // Append user message
    const updatedMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Map history to backend-friendly schema
      const history = updatedMessages.slice(0, -1);

      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: textToSend,
          history
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: "Sorry, I had trouble parsing that. Please try again." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "An error occurred connecting to the backend. Please check your API server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Career Coach AI</h1>
          <p className="page-subtitle">Get professional mentoring, interview techniques, and career tips instantly.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Chat Area */}
        <div>
          <div className="chat-container">
            <div className="chat-history">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`chat-bubble ${msg.role === 'user' ? 'user' : 'coach'}`}
                >
                  <div style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-secondary)', 
                    marginBottom: '4px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {msg.role === 'user' ? 'You' : 'Career Coach'} 
                    {msg.role !== 'user' && <Sparkles size={10} style={{ color: 'var(--accent-indigo)' }} />}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="chat-bubble coach">
                  <div style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-secondary)', 
                    marginBottom: '6px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Career Coach <Sparkles size={10} style={{ color: 'var(--accent-indigo)' }} />
                  </div>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="chat-input-area">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ask about resumes, STAR format, negotiation..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '0 24px' }}
                disabled={loading || !input.trim()}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Info & Presets Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} style={{ color: 'var(--accent-indigo)' }} />
              Quick Prompts
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              Click any option below to prompt the coach instantly:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {presets.map((preset, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSend(preset)}
                  className="btn btn-secondary"
                  style={{ 
                    fontSize: '12px', 
                    padding: '8px 12px', 
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: '8px',
                    lineHeight: '1.4'
                  }}
                  disabled={loading}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#a5b4fc' }}>Coach Insights</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
              This assistant utilizes situational coaching methodology. For the best responses, give detailed information about your target industry, experience level, and the specific role you are applying to.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
