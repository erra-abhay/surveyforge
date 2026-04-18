import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, ExternalLink, Settings, Loader2, Check } from 'lucide-react';
import api from '../utils/axios';
import QuestionEditor from '../components/builder/QuestionEditor';

const SurveyBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    setSurvey(null);
    setError(null);
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/surveys/${id}`);
      if (res.data.success) {
        setSurvey(res.data.data.survey);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load survey.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (field, value) => {
    setSurvey(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionUpdate = (questionId, updatedQuestion) => {
    setSurvey(prev => {
      const qs = [...prev.questions];
      const index = qs.findIndex(q => (q._id === questionId || q.tempId === questionId));
      if (index !== -1) {
        qs[index] = updatedQuestion;
      }
      return { ...prev, questions: qs };
    });
  };

  const removeQuestion = (questionId) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => (q._id !== questionId && q.tempId !== questionId))
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      tempId: `new_${Date.now()}`,
      text: 'Untitled Question',
      type: 'multiple_choice',
      required: false,
      options: [{ text: 'Option 1', value: 'opt_1' }, { text: 'Option 2', value: 'opt_2' }]
    };
    setSurvey(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const moveQuestion = (index, direction) => {
    setSurvey(prev => {
      const qs = [...prev.questions];
      const temp = qs[index];
      qs[index] = qs[index + direction];
      qs[index + direction] = temp;
      return { ...prev, questions: qs };
    });
  };

  const saveSurvey = async () => {
    // Basic validation
    if (!survey.title?.trim()) {
      setError('Survey title is required.');
      return;
    }

    if (!survey.questions || survey.questions.length === 0) {
      setError('A survey must have at least one question.');
      setIsSaving(false);
      return;
    }

    const emptyQuestions = survey.questions.filter(q => !q.text?.trim());
    if (emptyQuestions.length > 0) {
      setError('All questions must have text. Please check frames with empty titles.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const payload = {
        title: survey.title,
        description: survey.description,
        status: survey.status,
        theme: survey.theme,
        questions: survey.questions.map(q => {
          const { tempId, ...rest } = q;
          return rest;
        })
      };

      const res = await api.put(`/surveys/${id}`, payload);
      if (res.data.success) {
         setSurvey(res.data.data.survey);
      }
    } catch (err) {
      console.error('Failed to save', err);
      const message = err.response?.data?.message || 'Failed to save changes. Please check for validation errors.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
         <div className="flex flex-col items-center gap-4">
           <Loader2 className="animate-spin text-primary" size={40} />
           <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Compiling Matrix</p>
         </div>
      </div>
    );
  }

  if (!survey) {
    return <div className="p-8 text-center text-red-500 font-bold">{error || 'Survey record not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      {error && (
        <div className="bg-red-500 text-white px-6 py-3 flex justify-between items-center animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">!</div>
            <p className="text-sm font-bold uppercase tracking-widest leading-none pt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      )}
      {/* Top Navbar */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white rounded-xl hover:bg-primary transition-all duration-300">
             <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
          {survey.status === 'draft' ? (
            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">DRAFT STAGE</span>
          ) : (
            <span className="px-3 py-1.5 bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-green-200/50 dark:border-green-800/30">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> LIVE
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <a href={`/s/${survey.shareToken}`} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-transparent hover:border-primary/20">
            <ExternalLink size={16} strokeWidth={2.5} /> Preview Frame
          </a>
          <div className="relative">
            <button 
               onClick={() => setShowSettingsModal(!showSettingsModal)}
               className={`p-2.5 rounded-xl transition-all shadow-sm ${showSettingsModal ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary'}`}
               title="Form Settings"
            >
              <Settings size={20} strokeWidth={2.5} />
            </button>
            
            {showSettingsModal && (
               <div className="absolute top-full right-0 mt-4 w-[360px] bg-white dark:bg-slate-900 rounded-3xl p-6 subtle-shadow border border-slate-100 dark:border-slate-800 z-[100] shadow-2xl animate-fade-in origin-top-right">
                  <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white font-heading tracking-tight">Deployment Settings</h3>
                  
                  <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Frame Status</label>
                         <select 
                            value={survey.status}
                            onChange={(e) => handleUpdate('status', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold outline-none focus:border-primary text-sm shadow-sm appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                         >
                            <option value="draft">Draft Protocol (Private)</option>
                            <option value="active">Deploy Live (Public)</option>
                            <option value="closed">Locked down (Closed)</option>
                         </select>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Termination Message (Thank You)</label>
                         <textarea 
                            value={survey.settings?.thankYouMessage || ''}
                            onChange={(e) => handleUpdate('settings', { ...survey.settings, thankYouMessage: e.target.value })}
                            rows={3}
                            placeholder="Data received. Over and out."
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium outline-none focus:border-primary resize-none text-sm shadow-sm placeholder:text-slate-400"
                         ></textarea>
                      </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <button 
                         onClick={() => setShowSettingsModal(false)}
                         className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                         Dismiss
                      </button>
                      <button 
                         onClick={async () => {
                             setShowSettingsModal(false);
                             await saveSurvey();
                         }} 
                         className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover-lift shadow-xl shadow-primary/30"
                      >
                         Commit changes
                      </button>
                  </div>
               </div>
            )}
          </div>
          <button 
            onClick={saveSurvey}
            disabled={isSaving}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold py-3 px-6 rounded-xl transition-all hover-lift shadow-xl flex items-center gap-2 border border-slate-800 dark:border-white shadow-slate-900/20"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
            {isSaving ? 'Committing...' : 'Commit Code'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full relative">
        <div className="max-w-4xl mx-auto py-12 px-6 lg:px-0 relative z-10">
          
          {/* Survey Header Setup */}
          <div className="glass-card bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 mb-12 subtle-shadow border-t-8 border-t-primary shadow-2xl shadow-primary/10">
            <input 
              type="text" 
              value={survey.title} 
              onChange={(e) => handleUpdate('title', e.target.value)}
              placeholder="Form Heading..."
              className="w-full text-3xl md:text-4xl font-heading font-black bg-transparent border-0 border-b-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-primary focus:ring-0 px-0 py-3 outline-none transition-all mb-4 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 tracking-tight"
            />
            <textarea 
              value={survey.description}
              onChange={(e) => handleUpdate('description', e.target.value)}
              placeholder="Establish parameters and description for end-users (optional)"
              rows={2}
              className="w-full text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium bg-transparent border-0 border-b-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-primary focus:ring-0 px-0 py-2 outline-none transition-all resize-none placeholder-slate-400 dark:placeholder-slate-600 leading-relaxed"
            />
          </div>

          {/* Question List */}
          <div className="space-y-8">
            {(survey.questions || []).map((q, idx) => (
              <QuestionEditor 
                key={q._id || q.tempId}
                question={q}
                index={idx}
                updateQuestion={handleQuestionUpdate}
                removeQuestion={removeQuestion}
                moveQuestion={moveQuestion}
                totalQuestions={survey.questions.length}
              />
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center pb-32">
            <button 
              onClick={addQuestion}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-4 px-8 rounded-2xl transition-all hover-lift shadow-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:text-primary flex items-center gap-3 text-lg"
            >
              <Plus size={24} strokeWidth={3} className="text-primary" />
              Append New Frame
            </button>
          </div>
        </div>

        {/* Global Floating Action Bar for rapid save */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
           <div className="bg-slate-900/90 dark:bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-800 dark:border-slate-100">
              <span className="px-4 text-sm font-bold text-slate-300 dark:text-slate-600">Unsaved permutations present</span>
              <button 
                 onClick={saveSurvey}
                 disabled={isSaving}
                 className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg"
              >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                  Commit
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilder;
