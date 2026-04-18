import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import api from '../utils/axios';

const PublicSurvey = () => {
  const { shareToken } = useParams();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSurvey();
  }, [shareToken]);

  const fetchSurvey = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/surveys/public/${shareToken}`);
      if (res.data.success) {
        setSurvey(res.data.data.survey);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Survey not found or inactive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSingleChoice = (questionId, value) => {
     setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultipleChoice = (questionId, value, checked) => {
     setAnswers(prev => {
        const current = Array.isArray(prev[questionId]) ? [...prev[questionId]] : [];
        if (checked) {
           current.push(value);
        } else {
           const index = current.indexOf(value);
           if (index !== -1) current.splice(index, 1);
        }
        return { ...prev, [questionId]: current };
     });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       setIsSubmitting(true);
       
       const formattedAnswers = survey.questions.map(q => {
          const userVal = answers[q._id];
          if (!userVal) {
             return { questionId: q._id, skipped: true };
          }
          
          let payloadAns = { questionId: q._id, skipped: false };
          
          if (q.type === 'text' || q.type === 'textarea' || q.type === 'rating' || q.type === 'short_text' || q.type === 'long_text') {
             payloadAns.value = String(userVal);
          } else if (q.type === 'single_choice' || q.type === 'yes_no') {
             payloadAns.selectedOptions = [{ optionId: userVal }];
          } else if (q.type === 'multiple_choice' || q.type === 'checkbox') {
             payloadAns.selectedOptions = userVal.map(id => ({ optionId: id }));
          }
          
          return payloadAns;
       });

       const res = await api.post(`/responses/survey/${shareToken}`, { answers: formattedAnswers });
       if (res.data.success) {
          setIsSubmitted(true);
       }
    } catch (err) {
       console.error(err);
       alert(err.response?.data?.message || 'Submission failed');
    } finally {
       setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
         <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Unavailable</h2>
            <p className="text-slate-500">{error || 'This survey is not currently accepting responses.'}</p>
         </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
         <div className="glass-card p-10 rounded-2xl max-w-md w-full text-center subtle-shadow border-t-8 border-t-green-500">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
            </div>
            <h2 className="text-3xl font-heading font-bold text-slate-800 mb-3">Thank You!</h2>
            <p className="text-slate-600 text-lg">Your response has been successfully recorded.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
         
         <div className="glass-card bg-white rounded-3xl p-8 md:p-12 mb-8 shadow-xl shadow-slate-200/40 border-t-8 border-t-primary relative overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="relative z-10">
               <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">{survey.title}</h1>
               {survey.description && (
                  <p className="text-lg text-slate-600 whitespace-pre-wrap">{survey.description}</p>
               )}
             </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-8">
            {survey.questions.map((q, idx) => (
               <div key={q._id} className="glass-card bg-white rounded-2xl p-6 md:p-8 subtle-shadow border border-slate-100">
                  <h3 className="text-xl font-medium text-slate-800 mb-4 flex">
                     <span className="text-slate-400 mr-3">{idx + 1}.</span> 
                     {q.text}
                     {q.required && <span className="text-red-500 ml-1.5">*</span>}
                  </h3>
                  
                  <div className="mt-4 pl-7 text-slate-700">
                     {/* Text Input (Short) */}
                     {(q.type === 'text' || q.type === 'short_text') && (
                        <input 
                          type="text"
                          required={q.required}
                          onChange={(e) => handleTextChange(q._id, e.target.value)}
                          className="w-full border-b-2 border-slate-200 focus:border-primary px-2 py-2 bg-transparent outline-none transition-colors"
                          placeholder="Your answer"
                        />
                     )}

                     {/* Textarea (Long) */}
                     {(q.type === 'textarea' || q.type === 'long_text') && (
                        <textarea 
                          required={q.required}
                          onChange={(e) => handleTextChange(q._id, e.target.value)}
                          className="w-full border-b-2 border-slate-200 focus:border-primary px-2 py-2 bg-transparent outline-none transition-colors resize-y min-h-[100px]"
                          placeholder="Your answer"
                        />
                     )}

                     {/* Single Choice Radio */}
                     {q.type === 'single_choice' && (
                        <div className="space-y-3">
                           {q.options.map(opt => (
                              <label key={opt.value} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors group">
                                 <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                                    <input 
                                      type="radio" 
                                      name={q._id}
                                      value={opt.value}
                                      required={q.required}
                                      onChange={() => handleSingleChoice(q._id, opt._id)}
                                      className="peer shrink-0 w-5 h-5 appearance-none border-2 border-slate-300 rounded-full checked:border-primary transition-colors"
                                    />
                                    <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                 </div>
                                 <span className="text-slate-700 group-hover:text-slate-900">{opt.text}</span>
                              </label>
                           ))}
                        </div>
                     )}

                     {/* Multiple Choice Checkbox */}
                     {q.type === 'multiple_choice' && (
                        <div className="space-y-3">
                           {q.options.map(opt => (
                              <label key={opt.value} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors group">
                                 <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                                    <input 
                                      type="checkbox" 
                                      name={`${q._id}_${opt.value}`}
                                      value={opt.value}
                                      onChange={(e) => handleMultipleChoice(q._id, opt._id, e.target.checked)}
                                      className="peer shrink-0 w-5 h-5 appearance-none border-2 border-slate-300 rounded checked:bg-primary checked:border-primary transition-colors"
                                    />
                                    <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                 </div>
                                 <span className="text-slate-700 group-hover:text-slate-900">{opt.text}</span>
                              </label>
                           ))}
                        </div>
                     )}

                     {/* Rating 1-5 */}
                     {q.type === 'rating' && (
                        <div className="flex flex-wrap gap-2 md:gap-4">
                           {[1, 2, 3, 4, 5].map(rating => (
                              <label key={rating} className="cursor-pointer">
                                 <input 
                                   type="radio" 
                                   name={q._id} 
                                   value={rating} 
                                   required={q.required}
                                   onChange={() => handleSingleChoice(q._id, rating.toString())}
                                   className="sr-only peer" 
                                 />
                                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 border-slate-200 flex items-center justify-center text-lg font-bold text-slate-500 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white transition-all hover:border-slate-300">
                                    {rating}
                                 </div>
                              </label>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            ))}

            <div className="pt-6 pb-20 flex justify-between items-center">
               <button 
                 type="submit"
                 disabled={isSubmitting}
                 className="bg-primary hover:bg-primary/90 text-white text-lg font-medium py-3.5 px-8 rounded-xl transition-all hover-lift shadow-xl shadow-primary/25 flex items-center gap-2"
               >
                 {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                 {isSubmitting ? 'Submitting...' : 'Submit Response'}
               </button>
               
               <div className="text-sm text-slate-400 font-medium tracking-wide">
                  POWERED BY <span className="text-primary font-bold">SURVEYFORGE</span>
               </div>
            </div>
         </form>

      </div>
    </div>
  );
};

export default PublicSurvey;
