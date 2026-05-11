import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, UploadCloud, FileText, CheckCircle, 
  Activity, Target, TrendingUp, Microscope, Users, BookOpen, 
  Mail, Flame, Compass, Zap, Layers, Sparkles, Lock, ArrowUpRight,
  ChevronRight, Database
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './index.css';

// Utility to shuffle options so worst-to-best progression is hidden
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Qualitative Text options, with String IDs instead of numeric values
// The frontend has ZERO knowledge of what these options are worth mathematically.
const SECTIONS = [
  {
    id: 'upload',
    title: 'Initial Intake',
    description: 'Please upload your most recent CV or Research Resume. This allows the system to ground its assessment.',
    icon: <UploadCloud size={40} />,
    questions: [
      {
        id: 'resume',
        label: 'Upload your CV / Resume',
        type: 'file',
      }
    ]
  },
  {
    id: 'identity',
    title: 'Your Research Narrative',
    description: 'Before outreach begins, we must evaluate the strength and specificity of your academic identity.',
    icon: <Microscope size={40} />,
    questions: [
      {
        id: 'P',
        label: 'How would you describe your current research focus?',
        type: 'radio',
        options: [
          { value: 'p_broad', text: 'A general interest in an overarching field', icon: <Compass /> },
          { value: 'p_subfield', text: 'A specific named subfield', icon: <BookOpen /> },
          { value: 'p_app', text: 'A specific application or use-case', icon: <Layers /> },
          { value: 'p_problem', text: 'A named specific problem', icon: <Target /> },
          { value: 'p_context', text: 'High-level context & specific constraints', icon: <Zap /> },
          { value: 'p_gap', text: 'A clearly identified gap with direction', icon: <Sparkles /> }
        ]
      },
      {
        id: 'E',
        label: 'What is your strongest piece of tangible evidence?',
        type: 'radio',
        options: [
          { value: 'e_none', text: 'No projects or writing yet', icon: <CheckCircle /> },
          { value: 'e_class', text: 'Relevant coursework only', icon: <BookOpen /> },
          { value: 'e_private', text: 'Private or unpublished personal project', icon: <Lock /> },
          { value: 'e_public', text: 'Publicly accessible project repository', icon: <Layers /> },
          { value: 'e_clean', text: 'Cleanly documented public work', icon: <FileText /> },
          { value: 'e_high', text: 'High-level engagement with published research', icon: <Zap /> }
        ]
      },
      {
        id: 'D',
        label: 'How clear is your immediate research direction?',
        type: 'radio',
        options: [
          { value: 'd_figuring', text: 'Still exploring general options', icon: <Compass /> },
          { value: 'd_broad', text: 'Broad area chosen, but open to pivots', icon: <Activity /> },
          { value: 'd_sub', text: 'Specific subfield chosen definitively', icon: <BookOpen /> },
          { value: 'd_prob', text: 'Defined research problem', icon: <Target /> },
          { value: 'd_meth', text: 'Defined problem + proposed methodology', icon: <Layers /> },
          { value: 'd_novel', text: 'Novel hypothesis + clear approach', icon: <Sparkles /> }
        ]
      }
    ]
  },
  {
    id: 'targeting',
    title: 'Targeting Precision',
    description: 'We evaluate who you are emailing and the underlying health of the labs you are targeting.',
    icon: <Target size={40} />,
    questions: [
      {
        id: 'H',
        label: 'Who is your primary target for initial contact?',
        type: 'radio',
        options: [
          { value: 'h_mid', text: 'Mid-Senior PhD Candidate (Years 2-4)', icon: <Users /> },
          { value: 'h_postdoc', text: 'Postdoctoral Researcher', icon: <Users /> },
          { value: 'h_manager', text: 'Lab Manager / Coordinator', icon: <Users /> },
          { value: 'h_pi', text: 'Principal Investigator directly', icon: <Users /> }
        ]
      },
      {
        id: 'L',
        label: 'Select all that apply to the target lab:',
        type: 'multiselect',
        options: [
          { value: 'l_pub', text: 'Published in the last 12 months', icon: <CheckCircle /> },
          { value: 'l_fund', text: 'Active federal/private funding', icon: <Activity /> },
          { value: 'l_dean', text: 'The PI is the Dean or Department Head', icon: <Target /> },
          { value: 'l_huge', text: 'The lab has more than 30 active members', icon: <Users /> },
          { value: 'l_grant', text: 'Recently renewed grants', icon: <TrendingUp /> },
          { value: 'l_phd', text: 'Multiple mid-level PhDs', icon: <Users /> },
          { value: 'l_old', text: 'Website was last updated before 2022', icon: <Compass /> },
          { value: 'l_hire', text: 'Actively advertising positions', icon: <Zap /> }
        ]
      },
      {
        id: 'S',
        label: 'How specifically does your background align with this lab?',
        type: 'radio',
        options: [
          { value: 's_general', text: 'Overarching thematic interest', icon: <Layers /> },
          { value: 's_meth', text: 'Shared methodological tools', icon: <Layers /> },
          { value: 's_direct', text: 'Direct overlap with an active project', icon: <Layers /> }
        ]
      }
    ]
  },
  {
    id: 'contribution',
    title: 'Pre-Contribution Artifact',
    description: 'The method relies on "inverting the ask" by providing value before requesting time.',
    icon: <FileText size={40} />,
    questions: [
      {
        id: 'F',
        label: 'How tailored is the work you plan to share with them?',
        type: 'radio',
        options: [
          { value: 'f_resume', text: 'Standard academic resume', icon: <FileText /> },
          { value: 'f_artifact', text: 'Formatted appropriate artifact', icon: <FileText /> },
          { value: 'f_tailored', text: 'Highly tailored (e.g. figure replication)', icon: <Zap /> }
        ]
      },
      {
        id: 'D_artifact',
        label: 'What is the technical depth of this artifact?',
        type: 'radio',
        options: [
          { value: 'da_super', text: 'Superficial conceptual understanding', icon: <Compass /> },
          { value: 'da_solid', text: 'Solid operational depth but limited scope', icon: <Layers /> },
          { value: 'da_defend', text: 'Defensible in a rigorous technical interview', icon: <Zap /> }
        ]
      },
      {
        id: 'A',
        label: 'How accessible is this artifact to the recipient?',
        type: 'radio',
        options: [
          { value: 'a_lock', text: 'Behind a login or broken link', icon: <Lock /> },
          { value: 'a_setup', text: 'Accessible but requires local setup', icon: <Activity /> },
          { value: 'a_clean', text: 'One-click immediate access (Clean PDF/Repo)', icon: <CheckCircle /> }
        ]
      }
    ]
  },
  {
    id: 'warm_signal',
    title: 'Network Priming',
    description: 'Cold outreach performs best when the recipient already recognizes your name.',
    icon: <Flame size={40} />,
    questions: [
      {
        id: 'E_warm',
        label: 'When did you last engage with the target\'s public work?',
        type: 'radio',
        options: [
          { value: 'ew_never', text: 'More than a month ago / never', icon: <Compass /> },
          { value: 'ew_recent', text: 'Within the last 2 weeks', icon: <Activity /> },
          { value: 'ew_prime', text: 'Exactly 3 to 5 days before emailing', icon: <Flame /> }
        ]
      },
      {
        id: 'R',
        label: 'How strong was that engagement?',
        type: 'radio',
        options: [
          { value: 'r_low', text: 'Liked or bookmarked a post', icon: <CheckCircle /> },
          { value: 'r_med', text: 'General comment or attended event', icon: <Users /> },
          { value: 'r_high', text: 'Specific technical reply or email', icon: <Zap /> }
        ]
      },
      {
        id: 'T_warm',
        label: 'What was the technical credibility of your interaction?',
        type: 'radio',
        options: [
          { value: 'tw_obs', text: 'A general supportive observation', icon: <Compass /> },
          { value: 'tw_quest', text: 'A methodological question', icon: <Target /> },
          { value: 'tw_analyt', text: 'A specific analytical observation', icon: <Sparkles /> }
        ]
      }
    ]
  },
  {
    id: 'outreach',
    title: 'Outreach Execution',
    description: 'Volume and communication quality dictate your pipeline velocity.',
    icon: <Mail size={40} />,
    questions: [
      {
        id: 'V',
        label: 'What is your planned daily email volume?',
        type: 'radio',
        options: [
          { value: 'v_low', text: 'Low Volume (1-3 emails / day)', icon: <Mail /> },
          { value: 'v_mod', text: 'Moderate Volume (5-8 emails / day)', icon: <TrendingUp /> },
          { value: 'v_high', text: 'High Volume (10-15 emails / day)', icon: <Sparkles /> },
          { value: 'v_hyper', text: 'Hyper-Scale (20+ emails / day)', icon: <Flame /> }
        ]
      },
      {
        id: 'S_sub',
        label: 'How specific is your email subject line?',
        type: 'radio',
        options: [
          { value: 'ss_opp', text: '"Research Opportunity Inquiry"', icon: <Mail /> },
          { value: 'ss_name', text: 'Names the field or the lab name', icon: <BookOpen /> },
          { value: 'ss_action', text: 'Names a specific element + signals action', icon: <Target /> },
          { value: 'ss_proof', text: 'Curiosity + proof of work + identity', icon: <Zap /> }
        ]
      },
      {
        id: 'H_hook',
        label: 'How are you opening the email?',
        type: 'radio',
        options: [
          { value: 'hh_int', text: '"I am very interested in your research."', icon: <Compass /> },
          { value: 'hh_find', text: 'Name a specific finding from their paper', icon: <BookOpen /> },
          { value: 'hh_deep', text: 'Name a deep technical detail from paper', icon: <Target /> },
          { value: 'hh_conn', text: 'Connect their technical detail to my work', icon: <Layers /> },
          { value: 'hh_intellec', text: 'Frame as genuine intellectual observation', icon: <Sparkles /> }
        ]
      },
      {
        id: 'MV',
        label: 'How do you frame the mutual value?',
        type: 'radio',
        options: [
          { value: 'mv_gain', text: 'I state I would love to gain experience', icon: <Compass /> },
          { value: 'mv_skill', text: 'I state a specific skill I want to learn', icon: <BookOpen /> },
          { value: 'mv_both', text: 'I state what I can contribute and gain', icon: <Layers /> },
          { value: 'mv_proj', text: 'I offer to contribute to an active project', icon: <Target /> },
          { value: 'mv_serve', text: 'I show how it serves their specific goals', icon: <Zap /> }
        ]
      },
      {
        id: 'CTA',
        label: 'What is your Call To Action?',
        type: 'radio',
        options: [
          { value: 'cta_conn', text: 'A vague request to connect', icon: <Compass /> },
          { value: 'cta_meet', text: 'A clear ask for a brief meeting', icon: <Mail /> },
          { value: 'cta_low', text: 'A highly specific, low-friction request', icon: <Zap /> }
        ]
      }
    ]
  },
  {
    id: 'momentum',
    title: 'Cycle Momentum',
    description: 'Placement compounding relies on previous successes.',
    icon: <TrendingUp size={40} />,
    questions: [
      {
        id: 'M',
        label: 'What stage of the placement journey are you in?',
        type: 'radio',
        options: [
          { value: 'm_first', text: 'First placement cycle (Baseline)', icon: <Compass /> },
          { value: 'm_one', text: 'One active lab affiliation (Cycle 2)', icon: <Layers /> },
          { value: 'm_multi', text: 'Multiple affiliations + warm network (Cycle 3)', icon: <Users /> },
          { value: 'm_strong', text: 'Strong public signal + inbound requests (Cycle 4+)', icon: <Sparkles /> }
        ]
      }
    ]
  }
];

export default function App() {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  
  // App Flow States
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  
  // API Results
  const [calcResults, setCalcResults] = useState(null);
  const [simulatedVolume, setSimulatedVolume] = useState(null);

  const totalQuestions = SECTIONS.reduce((acc, sec) => acc + sec.questions.length, 0);
  let questionsAnswered = 0;
  for (let i = 0; i < sectionIndex; i++) {
    questionsAnswered += SECTIONS[i].questions.length;
  }
  questionsAnswered += questionIndex;
  
  const progressPercentage = (questionsAnswered / totalQuestions) * 100;

  const currentSection = SECTIONS[sectionIndex];
  const currentQuestion = currentSection?.questions[questionIndex];

  // Shuffle options safely when question changes, using useMemo to avoid re-shuffling on re-renders
  const currentShuffledOptions = useMemo(() => {
    if (currentQuestion && currentQuestion.options) {
      return shuffleArray(currentQuestion.options);
    }
    return [];
  }, [currentQuestion]);

  const handleAnswer = (questionId, value, autoAdvance = true, isMultiselect = false) => {
    if (isMultiselect) {
      setAnswers(prev => {
        const currentArr = prev[questionId] || [];
        if (currentArr.includes(value)) {
          return { ...prev, [questionId]: currentArr.filter(v => v !== value) };
        } else {
          return { ...prev, [questionId]: [...currentArr, value] };
        }
      });
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
      if (autoAdvance) {
        setTimeout(() => handleNext(), 300);
      }
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setFileUploaded(true);
        handleAnswer('resume', true, true);
      }, 1500);
    }
  };

  const handleNext = async () => {
    if (questionIndex < currentSection.questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else if (sectionIndex < SECTIONS.length - 1) {
      setSectionIndex(prev => prev + 1);
      setQuestionIndex(0);
    } else {
      setIsFinished(true);
      await fetchCalculation();
    }
  };

  const fetchCalculation = async (simVolume = null) => {
    setIsCalculating(true);
    try {
      // Securely fetch the proprietary formula from the black-box backend
      const res = await fetch('http://localhost:3001/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, simulatedVolume: simVolume })
      });
      const data = await res.json();
      setCalcResults(data);
    } catch (err) {
      console.error("Backend connection failed.", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePrev = () => {
    if (questionIndex > 0) {
      setQuestionIndex(prev => prev - 1);
    } else if (sectionIndex > 0) {
      setSectionIndex(prev => prev - 1);
      setQuestionIndex(SECTIONS[sectionIndex - 1].questions.length - 1);
    }
  };

  const unlockDashboard = async (e) => {
    e.preventDefault();
    if (leadEmail.includes('@')) {
      // Send Lead to Backend
      try {
        await fetch('http://localhost:3001/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: leadEmail })
        });
      } catch (e) {
        console.error(e);
      }
      setIsUnlocked(true);
    }
  };

  const handleSimulatorChange = (e) => {
    const val = Number(e.target.value);
    setSimulatedVolume(val);
    fetchCalculation(val); // Re-run backend calculation on slider change
  };

  // Framer Motion Animation Variants
  const pageVariants = {
    initial: { opacity: 0, y: 30, scale: 0.98 },
    in: { opacity: 1, y: 0, scale: 1 },
    out: { opacity: 0, y: -30, scale: 1.02 }
  };
  const pageTransition = { type: 'tween', ease: 'anticipate', duration: 0.6 };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <a href="#" className="brand-logo" style={{ textDecoration: 'none' }}>
          Axiom <span>Consulting</span>
        </a>
        {!isFinished && (
          <div className="progress-pill">
            {Math.round(progressPercentage)}% Complete
          </div>
        )}
      </header>

      <main className="main-content">
        <AnimatePresence mode="wait">
          
          {!isStarted ? (
            <motion.div 
              key="landing"
              className="section-container landing-container"
              initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            >
              <div className="landing-hero">
                <div style={{ background: 'var(--bg-white)', padding: '8px 16px', borderRadius: '24px', display: 'inline-block', marginBottom: '24px', border: '1px solid var(--rule)', color: 'var(--brand-pastel-dark)', fontWeight: '600', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Proprietary Diagnostic
                </div>
                <h1 className="landing-title">Discover Your True Placement Potential.</h1>
                <p className="landing-desc">
                  Take the private 2-minute Axiom Diagnostic. Uncover critical flaws in your outreach strategy, evaluate your academic narrative, and mathematically forecast your interview yield at elite research labs.
                </p>
                <button className="btn btn-primary btn-large" onClick={() => setIsStarted(true)} style={{ fontSize: '18px', padding: '20px 48px', borderRadius: '12px' }}>
                  Begin Private Diagnostic <ArrowRight size={24} />
                </button>
              </div>

              <div className="landing-features">
                <div className="feature-card">
                  <Activity size={32} color="var(--brand-pastel-dark)" />
                  <h4>Identify Fatal Flaws</h4>
                  <p>Catch the silent mistakes in your outreach that guarantee rejection.</p>
                </div>
                <div className="feature-card">
                  <Database size={32} color="var(--brand-pastel-dark)" />
                  <h4>1,000+ Data Points</h4>
                  <p>Powered by our proprietary placement algorithm and success metrics.</p>
                </div>
                <div className="feature-card">
                  <TrendingUp size={32} color="var(--brand-pastel-dark)" />
                  <h4>Yield Forecasting</h4>
                  <p>See exactly how many interviews your current strategy will realistically generate.</p>
                </div>
              </div>
            </motion.div>
          ) : !isFinished ? (
            <motion.div 
              key={`${sectionIndex}-${questionIndex}`} 
              className="split-layout"
              initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            >
              <div className="split-left">
                <div className="section-container" style={{ margin: 0 }}>
                  <div className="section-header" style={{ textAlign: 'left' }}>
                    <div className="section-icon-wrapper" style={{ margin: '0 0 24px 0' }}>
                      {currentSection.icon}
                    </div>
                    <h1 className="section-title">{currentSection.title}</h1>
                    <p className="section-desc" style={{ margin: 0 }}>{currentSection.description}</p>
                  </div>

                  <div className="interaction-area">
                    <h2 className="question-label">{currentQuestion.label}</h2>
                    
                    {currentQuestion.type === 'file' && (
                      <div className="upload-zone" onClick={() => document.getElementById('resume-upload').click()}>
                        <input type="file" id="resume-upload" style={{ display: 'none' }} onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                        {isUploading ? (
                          <div>
                            <Activity size={48} color="var(--brand-pastel-dark)" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1rem auto' }} />
                            <h3 style={{fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)'}}>Processing file...</h3>
                          </div>
                        ) : fileUploaded ? (
                          <div>
                            <FileText size={48} color="var(--brand-pastel-dark)" style={{ margin: '0 auto 1rem auto' }} />
                            <h3 style={{fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)'}}>Document Received</h3>
                            <p style={{color: 'var(--text-secondary)'}}>Securely uploaded to Axiom servers.</p>
                          </div>
                        ) : (
                          <div>
                            <UploadCloud size={64} color="var(--brand-pastel-dark)" style={{ margin: '0 auto 1rem auto' }} />
                            <h3 style={{fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)'}}>Drag & Drop or Click to Upload</h3>
                            <p style={{color: 'var(--text-secondary)'}}>PDF or DOCX (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    )}

                    {currentQuestion.type === 'radio' && (
                      <div className="options-image-grid">
                        {currentShuffledOptions.map((opt, idx) => {
                          const isSelected = answers[currentQuestion.id] === opt.value;
                          return (
                            <motion.div 
                              key={opt.value} 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`image-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                            >
                              <div className="card-illustration">
                                {opt.icon || <CheckCircle size={32} />}
                              </div>
                              <span className="card-text">{opt.text}</span>
                              <div className="card-indicator">
                                {isSelected && <CheckCircle size={20} />}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {currentQuestion.type === 'multiselect' && (
                      <div className="options-image-grid multiselect-grid">
                        {currentShuffledOptions.map((opt, idx) => {
                          const currentArr = answers[currentQuestion.id] || [];
                          const isSelected = currentArr.includes(opt.value);
                          return (
                            <motion.div 
                              key={opt.value} 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`image-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleAnswer(currentQuestion.id, opt.value, false, true)}
                            >
                              <div className="card-illustration">
                                {opt.icon || <CheckCircle size={32} />}
                              </div>
                              <span className="card-text">{opt.text}</span>
                              <div className="card-indicator">
                                {isSelected ? <CheckCircle size={20} /> : <div style={{ width: '20px', height: '20px', border: '2px solid var(--rule)', borderRadius: '4px' }} />}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    <div className="footer-actions">
                      <button className="btn btn-secondary" onClick={handlePrev} disabled={sectionIndex === 0 && questionIndex === 0}>
                        <ArrowLeft size={18} /> Back
                      </button>
                      <button 
                        className="btn btn-primary" 
                        onClick={handleNext} 
                        disabled={
                          (currentQuestion.type === 'radio' && answers[currentQuestion.id] === undefined) ||
                          (currentQuestion.type === 'file' && !fileUploaded) ||
                          (currentQuestion.type === 'multiselect' && (!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0))
                        }
                      >
                        Continue <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="split-right">
                <div className="sticky-image-container">
                  <img src="/assets/roadmap_pastel.png" alt="Axiom Method" className="side-image" />
                </div>
              </div>
            </motion.div>

          ) : isCalculating ? (
            <motion.div 
              key="calculating"
              className="section-container" 
              style={{ textAlign: 'center', marginTop: '100px' }}
              initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            >
               <Activity size={64} color="var(--brand-pastel-dark)" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 2rem auto' }} />
               <h1 className="section-title">Analyzing Your Profile</h1>
               <p className="section-desc">The Axiom proprietary engine is processing your academic narrative securely against 1,000+ elite lab placement data points...</p>
            </motion.div>
          ) : !isUnlocked ? (
            <motion.div 
              key="lead-gate"
              className="section-container" 
              style={{ maxWidth: '600px', marginTop: '50px' }}
              initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}
            >
              <div className="interaction-area" style={{ textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-pastel)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'var(--brand-pastel-dark)' }}>
                  <Lock size={40} />
                </div>
                <h2 className="question-label" style={{ marginBottom: '16px' }}>Your Report is Ready</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
                  We have generated your personalized Axiom Readiness Score and Placement Forecast. Enter your email to unlock your dashboard.
                </p>
                <form onSubmit={unlockDashboard}>
                  <input 
                    type="email" 
                    required 
                    placeholder="Enter your email address"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    style={{ width: '100%', padding: '16px 24px', borderRadius: '8px', border: '1px solid var(--rule)', fontSize: '16px', marginBottom: '16px', fontFamily: 'var(--font-body)' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Unlock My Results <ChevronRight size={18} />
                  </button>
                </form>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '24px' }}>
                  By continuing, you agree to receive strategic placement insights from Axiom Consulting. We will never share your information.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              className="section-container" 
              style={{ maxWidth: '1000px' }}
              initial="initial" animate="in" variants={pageVariants} transition={pageTransition}
            >
              <div className="section-header">
                <div className="section-icon-wrapper" style={{ background: 'var(--brand-pastel-dark)', color: 'white', borderColor: 'var(--brand-pastel-dark)' }}>
                  <CheckCircle size={40} />
                </div>
                <h1 className="section-title">Diagnostic Complete</h1>
                <p className="section-desc">The Axiom proprietary engine has processed your inputs. Review your readiness projection below.</p>
              </div>

              {calcResults && (
                <>
                  <div className="score-hero">
                    <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '14px', opacity: 0.8, fontWeight: '600' }}>Axiom Readiness Score</h3>
                    <div className="score-value">{calcResults.masterScore.toLocaleString(undefined, {maximumFractionDigits: 1})}</div>
                    
                    {calcResults.percentile && (
                      <div style={{ display: 'inline-block', background: 'var(--bg-pastel)', color: 'var(--brand-pastel-dark)', padding: '8px 24px', borderRadius: '24px', fontWeight: '600', fontSize: '16px', border: '1px solid var(--brand-pastel)', marginBottom: '16px' }}>
                        Top {100 - calcResults.percentile}% of Database Applicants
                      </div>
                    )}

                    <p style={{ opacity: 0.8, fontSize: '18px' }}>
                      {calcResults.killConditions.length > 0 ? "Critical Errors Detected" : "Profile Indexed against 1,000 Data Points"}
                    </p>
                  </div>

                  <div className="dashboard-grid">
                    <div className="dashboard-card">
                      <h3 style={{ marginBottom: '24px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '400' }}><Target size={24} color="var(--brand-pastel-dark)" /> Profile Balance</h3>
                      <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={calcResults.radarData}>
                            <PolarGrid stroke="var(--rule)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-body)' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                            <Radar name="Score" dataKey="score" stroke="var(--brand-pastel-dark)" strokeWidth={2} fill="var(--brand-pastel)" fillOpacity={0.4} />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="dashboard-card">
                      <h3 style={{ marginBottom: '24px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '400' }}><TrendingUp size={24} color="var(--brand-pastel-dark)" /> Placement Forecasting</h3>
                      
                      <div style={{ width: '100%', height: '240px' }}>
                        <ResponsiveContainer>
                          <LineChart data={calcResults.projectionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" />
                            <XAxis dataKey="cycle" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-body)' }} />
                            <YAxis yAxisId="left" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-body)' }} />
                            <Tooltip />
                            <Line yAxisId="left" type="monotone" dataKey="interviews" name="Projected Interviews" stroke="var(--brand-pastel-dark)" strokeWidth={3} activeDot={{ r: 8, fill: 'var(--brand-pastel-dark)' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-pastel)', borderRadius: '8px', border: '1px solid var(--rule)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'uppercase' }}>Simulate Strategy: Volume</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--brand-pastel-dark)' }}>{calcResults.effectiveVolume} emails/day</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="50" 
                          value={calcResults.effectiveVolume} 
                          onChange={handleSimulatorChange}
                          style={{ width: '100%', accentColor: 'var(--brand-pastel-dark)' }}
                        />
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>
                          Drag to simulate how increasing your outreach directly scales interviews.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-card" style={{ marginTop: '32px', borderTop: '4px solid var(--brand-pastel-dark)' }}>
                    <h3 style={{ marginBottom: '24px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '400' }}><Activity size={28} color="var(--brand-pastel-dark)"/> Predictive Outlook</h3>
                    <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                      Based on your profile and an outreach volume of <strong>{calcResults.effectiveVolume} emails/day</strong>, the engine forecasts:
                    </p>
                    <ul style={{ marginTop: '24px', paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '15px' }}>
                      {calcResults.killConditions.length > 0 ? (
                        <li style={{ color: '#EA4335', fontWeight: '500' }}>Your outreach strategy contains critical errors that will drop conversion to zero. Resolve these immediately.</li>
                      ) : (
                        <>
                          <li style={{ marginBottom: '12px' }}><strong>Short-term Projection:</strong> You are likely to land <strong>{calcResults.projectionData[0].interviews} interviews</strong> by the end of Cycle 1 (14 days).</li>
                          <li><strong>Long-term Compounding:</strong> By Cycle 3, your identical effort will yield <strong>{calcResults.projectionData[2].interviews} interviews</strong> due to affiliation stacking.</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div style={{ marginTop: '40px', background: 'var(--text-primary)', color: 'white', borderRadius: 'var(--radius-lg)', padding: '48px', textAlign: 'center', boxShadow: 'var(--shadow-hover)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '400', marginBottom: '16px' }}>
                      {calcResults.killConditions.length > 0 ? "Your strategy has critical flaws." : "Ready to guarantee your placement?"}
                    </h2>
                    <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto' }}>
                      {calcResults.killConditions.length > 0 
                        ? "Book a 50-minute Strategy Intensive. I will personally audit your profile, fix the fatal errors in your outreach, and build a working placement roadmap." 
                        : "You have a strong foundation. Apply for the 4-Week Launch mentorship, and I will personally ghostwrite your outreach and connect you to my network."}
                    </p>
                    <a href="https://calendly.com/ishaani-jain1/30min" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ background: 'var(--brand-pastel)', color: 'white', fontSize: '16px', padding: '18px 40px' }}>
                      Book Your Consultation Now <ArrowUpRight size={20} />
                    </a>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
