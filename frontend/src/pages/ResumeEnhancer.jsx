import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Sparkles, Save, Plus, Trash2, FileText, Briefcase, GraduationCap, Code, Target } from 'lucide-react';

export default function ResumeEnhancer() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enhancingSection, setEnhancingSection] = useState({ type: '', idx: -1 });
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  const [resume, setResume] = useState({
    personalInfo: { fullName: '', email: '', phone: '', github: '', linkedin: '', summary: '' },
    experience: [],
    education: [],
    skills: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/resume', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.resume) {
          setResume(data.resume);
        }
      } catch (err) {
        console.error("Error loading resume:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setFeedbackMsg({ text: '', type: '' });
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/resume', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resume)
      });
      const data = await response.json();
      if (data.success) {
        setResume(data.resume);
        setFeedbackMsg({ text: 'Resume saved successfully! Your profile is up to date.', type: 'success' });
        setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 5000);
      } else {
        setFeedbackMsg({ text: data.message || 'Failed to save resume', type: 'error' });
      }
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to connect to backend server', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEnhanceSummary = async () => {
    if (!resume.personalInfo.summary.trim()) return;
    setEnhancingSection({ type: 'summary', idx: -1 });
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/resume/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'summary',
          text: resume.personalInfo.summary,
          role: targetRole
        })
      });
      const data = await response.json();
      if (data.success) {
        setResume(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            summary: data.enhancedText
          }
        }));
        setFeedbackMsg({ text: 'Summary enhanced with AI magic!', type: 'success' });
        setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 5000);
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: 'Enhancement failed. Please try again later.', type: 'error' });
    } finally {
      setEnhancingSection({ type: '', idx: -1 });
    }
  };

  const handleEnhanceExperience = async (idx) => {
    const expItem = resume.experience[idx];
    if (!expItem || !expItem.description.trim()) return;

    setEnhancingSection({ type: 'experience', idx });
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/resume/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'experience',
          text: expItem.description,
          role: targetRole
        })
      });
      const data = await response.json();
      if (data.success) {
        const updatedExp = [...resume.experience];
        updatedExp[idx].description = data.enhancedText;
        setResume(prev => ({
          ...prev,
          experience: updatedExp
        }));
        setFeedbackMsg({ text: 'Job description optimized perfectly!', type: 'success' });
        setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 5000);
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: 'Enhancement failed. Please try again later.', type: 'error' });
    } finally {
      setEnhancingSection({ type: '', idx: -1 });
    }
  };

  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', role: '', startDate: '', endDate: '', description: '', aiSuggestions: '' }
      ]
    }));
  };

  const removeExperience = (idx) => {
    const updated = [...resume.experience];
    updated.splice(idx, 1);
    setResume(prev => ({ ...prev, experience: updated }));
  };

  const handleExperienceChange = (idx, field, value) => {
    const updated = [...resume.experience];
    updated[idx][field] = value;
    setResume(prev => ({ ...prev, experience: updated }));
  };

  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: '', degree: '', graduationYear: '' }
      ]
    }));
  };

  const removeEducation = (idx) => {
    const updated = [...resume.education];
    updated.splice(idx, 1);
    setResume(prev => ({ ...prev, education: updated }));
  };

  const handleEducationChange = (idx, field, value) => {
    const updated = [...resume.education];
    updated[idx][field] = value;
    setResume(prev => ({ ...prev, education: updated }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (resume.skills.includes(newSkill.trim())) {
      setNewSkill('');
      return;
    }
    setResume(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingBottom: '80px' }}>
      
      {/* Floating Header & Actions */}
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
          <h1 className="page-title" style={{ margin: 0 }}>Resume Enhancer</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>Draft and optimize your professional profile with AI.</p>
        </div>
        <button 
          onClick={handleSave} 
          className="btn btn-primary" 
          disabled={saving}
          style={{ padding: '12px 24px', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {feedbackMsg.text && (
        <div style={{ 
          background: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          border: `1px solid ${feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, 
          color: feedbackMsg.type === 'success' ? '#34d399' : '#f87171', 
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backdropFilter: 'blur(10px)',
          animation: 'fadeUp 0.3s ease-out'
        }}>
          {feedbackMsg.type === 'success' ? <Sparkles size={18} /> : null}
          {feedbackMsg.text}
        </div>
      )}

      {/* Target Role configuration */}
      <div className="card" style={{ 
        marginBottom: '32px', 
        background: 'linear-gradient(to right, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))',
        border: '1px solid rgba(168, 85, 247, 0.6)'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#E63636', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} style={{ color: '#E63636' }} />
          Career Alignment Target
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          We use this target role to tailor the AI suggestions and language used to rewrite your resume.
        </p>
        <div className="form-group" style={{ maxWidth: '400px', margin: 0 }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Senior Frontend Developer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            style={{ fontSize: '16px', padding: '12px' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Personal Info */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={22} style={{ color: 'var(--accent-indigo)' }} />
              Personal Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={resume.personalInfo.fullName}
                  onChange={(e) => setResume({
                    ...resume,
                    personalInfo: { ...resume.personalInfo, fullName: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={resume.personalInfo.email}
                  onChange={(e) => setResume({
                    ...resume,
                    personalInfo: { ...resume.personalInfo, email: e.target.value }
                  })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={resume.personalInfo.phone}
                  onChange={(e) => setResume({
                    ...resume,
                    personalInfo: { ...resume.personalInfo, phone: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">GitHub Profile</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={resume.personalInfo.github}
                  onChange={(e) => setResume({
                    ...resume,
                    personalInfo: { ...resume.personalInfo, github: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn Profile</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={resume.personalInfo.linkedin}
                  onChange={(e) => setResume({
                    ...resume,
                    personalInfo: { ...resume.personalInfo, linkedin: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label className="form-label" style={{ margin: 0 }}>Professional Summary</label>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '13px',
                    borderColor: 'var(--accent-blue)',
                    background: enhancingSection.type === 'summary' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 82, 204, 0.1)',
                    boxShadow: enhancingSection.type === 'summary' ? '0 0 15px rgba(99, 102, 241, 0.3)' : undefined
                  }}
                  onClick={handleEnhanceSummary}
                  disabled={enhancingSection.type === 'summary' || !resume.personalInfo.summary}
                >
                  <Sparkles size={16} className={enhancingSection.type === 'summary' ? 'pulse' : ''} style={{ color: 'var(--accent-indigo)' }} />
                  {enhancingSection.type === 'summary' ? 'Enhancing...' : 'Enhance with AI'}
                </button>
              </div>
              <textarea 
                className="form-control" 
                rows="5"
                placeholder="Briefly describe your professional background and goals..."
                value={resume.personalInfo.summary}
                onChange={(e) => setResume({
                  ...resume,
                  personalInfo: { ...resume.personalInfo, summary: e.target.value }
                })}
                style={{
                  transition: 'all 0.3s ease',
                  borderColor: enhancingSection.type === 'summary' ? 'var(--accent-indigo)' : undefined,
                  boxShadow: enhancingSection.type === 'summary' ? '0 0 20px rgba(99, 102, 241, 0.1)' : undefined
                }}
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase size={22} style={{ color: 'var(--accent-purple)' }} />
                Work Experience
              </h3>
              <button onClick={addExperience} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Plus size={16} /> Add Experience
              </button>
            </div>

            {resume.experience.length === 0 ? (
              <div style={{ 
                textAlign: 'center', padding: '40px', background: 'transparent', borderRadius: '12px', border: '1px dashed var(--accent-blue)'
              }}>
                <Briefcase size={40} style={{ color: 'rgba(0,0,0,0.1)', margin: '0 auto 16px auto' }} />
                <p style={{ color: 'var(--text-secondary)' }}>No experience listed yet. Add your work history.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {resume.experience.map((item, idx) => (
                  <div key={idx} style={{ 
                    padding: '24px', 
                    borderRadius: '16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--glass-border)',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover-lift"
                  >
                    <button 
                      onClick={() => removeExperience(idx)} 
                      style={{ 
                        position: 'absolute', top: '24px', right: '24px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171',
                        width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      <Trash2 size={16} />
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', paddingRight: '48px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Company</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={item.company}
                          onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Role</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={item.role}
                          onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Start Date</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Jan 2023"
                          value={item.startDate}
                          onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">End Date</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Present"
                          value={item.endDate}
                          onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label className="form-label" style={{ margin: 0 }}>Accomplishments & Impact</label>
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            borderColor: 'var(--accent-blue)',
                            background: enhancingSection.type === 'experience' && enhancingSection.idx === idx ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0, 82, 204, 0.1)',
                          }}
                          onClick={() => handleEnhanceExperience(idx)}
                          disabled={(enhancingSection.type === 'experience' && enhancingSection.idx === idx) || !item.description}
                        >
                          <Sparkles size={14} style={{ color: 'var(--accent-purple)' }} />
                          {enhancingSection.type === 'experience' && enhancingSection.idx === idx ? 'Enhancing...' : 'Enhance with AI'}
                        </button>
                      </div>
                      <textarea 
                        className="form-control" 
                        rows="5"
                        placeholder="Describe what you did and the impact you had..."
                        value={item.description}
                        onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                        style={{
                          transition: 'all 0.3s ease',
                          borderColor: enhancingSection.type === 'experience' && enhancingSection.idx === idx ? 'var(--accent-purple)' : undefined,
                          boxShadow: enhancingSection.type === 'experience' && enhancingSection.idx === idx ? '0 0 20px rgba(168, 85, 247, 0.1)' : undefined
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
            
            {/* Education */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GraduationCap size={22} style={{ color: '#0ea5e9' }} />
                  Education
                </h3>
                <button onClick={addEducation} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <Plus size={16} /> Add 
                </button>
              </div>

              {resume.education.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', padding: '30px', background: 'transparent', borderRadius: '12px', border: '1px dashed var(--accent-blue)'
                }}>
                  <p style={{ color: 'var(--text-secondary)' }}>No education added.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {resume.education.map((item, idx) => (
                    <div key={idx} style={{ 
                      padding: '20px', 
                      borderRadius: '12px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--glass-border)',
                      position: 'relative' 
                    }}>
                      <button 
                        onClick={() => removeEducation(idx)} 
                        style={{ 
                          position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' 
                        }}
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="form-group" style={{ marginBottom: '16px', paddingRight: '24px' }}>
                        <label className="form-label">Institution</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={item.institution}
                          onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Degree</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={item.degree}
                            onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Year</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={item.graduationYear}
                            onChange={(e) => handleEducationChange(idx, 'graduationYear', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Code size={22} style={{ color: '#ec4899' }} />
                Skills Profile
              </h3>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Type a skill & press Enter"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <button onClick={addSkill} className="btn btn-primary" style={{ padding: '0 16px', flexShrink: 0 }}>
                  <Plus size={18} />
                </button>
              </div>

              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px',
                padding: '20px',
                background: 'transparent',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.4)',
                minHeight: '120px',
                alignItems: 'flex-start'
              }}>
                {resume.skills.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', width: '100%', textAlign: 'center', margin: 'auto' }}>
                    Add technical skills, soft skills, and tools.
                  </p>
                ) : (
                  resume.skills.map((skill, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        background: 'linear-gradient(to right, rgba(236, 72, 153, 0.15), rgba(99, 102, 241, 0.15))',
                        border: '1px solid rgba(236, 72, 153, 0.7)',
                        color: 'white',
                        padding: '8px 14px',
                        borderRadius: '24px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        userSelect: 'none'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(99, 102, 241, 0.3))';
                        e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, rgba(236, 72, 153, 0.15), rgba(99, 102, 241, 0.15))';
                        e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.3)';
                      }}
                      onClick={() => removeSkill(skill)}
                      title="Click to remove"
                    >
                      {skill}
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
                        background: 'rgba(0,0,0,0.3)', borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px' 
                      }}>
                        ×
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
