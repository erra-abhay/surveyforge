import React, { useState } from 'react';
import { Trash2, GripVertical, ChevronUp, ChevronDown, Plus, Check } from 'lucide-react';

const questionTypes = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'single_choice', label: 'Single Choice (Radio)' },
  { value: 'multiple_choice', label: 'Multiple Choice (Checkbox)' },
  { value: 'rating', label: 'Rating (Star/Number)' },
];

const QuestionEditor = ({ question, index, updateQuestion, removeQuestion, moveQuestion, totalQuestions }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (field, value) => {
    updateQuestion(question._id || question.tempId, { ...question, [field]: value });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), { text: `Option ${(question.options?.length || 0) + 1}`, value: `opt_${Date.now()}` }];
    handleChange('options', newOptions);
  };

  const updateOption = (optIndex, text) => {
    const newOptions = [...question.options];
    newOptions[optIndex].text = text;
    handleChange('options', newOptions);
  };

  const removeOption = (optIndex) => {
    const newOptions = [...question.options];
    newOptions.splice(optIndex, 1);
    handleChange('options', newOptions);
  };

  return (
    <div className={`glass-card bg-white dark:bg-slate-900 rounded-3xl mb-8 transition-all duration-300 subtle-shadow border-2 border-slate-100 dark:border-slate-800 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 overflow-hidden relative group`}>
      
      {/* Decorative side border */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-200 group-focus-within:bg-primary transition-colors"></div>

      {/* Header / Draggable Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 px-6 md:px-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
           <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-grab hover:text-primary transition-colors shrink-0">
              <GripVertical size={16} />
           </div>
           <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-widest shrink-0">
             Frame {index + 1}
           </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0 ml-11 sm:ml-0">
           <select 
             value={question.type}
             onChange={(e) => handleChange('type', e.target.value)}
             className="flex-1 sm:flex-none text-sm font-bold px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-primary transition-colors cursor-pointer appearance-none shadow-sm min-w-[200px]"
             style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
           >
             {questionTypes.map(t => (
               <option key={t.value} value={t.value}>{t.label}</option>
             ))}
           </select>
           
           <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm shrink-0">
             <button 
                onClick={() => moveQuestion(index, -1)}
                disabled={index === 0}
                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
             >
                <ChevronUp size={18} strokeWidth={2.5} />
             </button>
             <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
             <button 
                onClick={() => moveQuestion(index, 1)}
                disabled={index === totalQuestions - 1}
                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
             >
                <ChevronDown size={18} strokeWidth={2.5} />
             </button>
             <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
             <button 
                onClick={() => removeQuestion(question._id || question.tempId)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Frame"
             >
                <Trash2 size={18} strokeWidth={2.5} />
             </button>
           </div>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-8 pl-10 md:pl-12">
        
        {/* Question Title */}
        <div className="relative">
          <input 
             type="text"
             value={question.text || ''}
             onChange={(e) => handleChange('text', e.target.value)}
             placeholder="Enter your question here..."
             className="w-full text-2xl md:text-3xl font-heading font-bold bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-0 px-0 py-3 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700"
          />
        </div>

        {/* Options Editor (Radio/Checkbox) */}
        {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
          <div className="space-y-4 max-w-3xl">
             {(question.options || []).map((opt, optIndex) => (
               <div key={optIndex} className="flex items-center gap-4 group/opt bg-slate-50 dark:bg-slate-800/30 p-2 pr-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                 <div className={`w-6 h-6 shrink-0 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm ${question.type === 'single_choice' ? 'rounded-full' : 'rounded-md'} border-2 border-slate-300 dark:border-slate-600 ml-2`}></div>
                 <input 
                   type="text"
                   value={opt.text}
                   onChange={(e) => updateOption(optIndex, e.target.value)}
                   className="flex-1 bg-transparent border-0 focus:ring-0 px-2 py-2 outline-none text-slate-700 dark:text-slate-300 font-medium text-lg placeholder-slate-400"
                   placeholder={`Option ${optIndex + 1}`}
                 />
                 <button 
                   onClick={() => removeOption(optIndex)}
                   className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover/opt:opacity-100 transition-all border border-slate-200 dark:border-slate-700 scale-95 group-hover/opt:scale-100"
                 >
                   <X size={16} strokeWidth={2.5} />
                 </button>
               </div>
             ))}
             <button 
               onClick={addOption}
               className="flex items-center gap-2 text-sm text-primary font-bold px-4 py-3 border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/5 hover:border-primary transition-all w-max mt-4 ml-2"
             >
               <Plus size={18} strokeWidth={3} /> Add Choice
             </button>
          </div>
        )}

        {/* Rating/Scale Config Placeholder */}
        {question.type === 'rating' && (
          <div className="flex gap-4 mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-sm">
             <div className="flex flex-col w-full text-center">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Rate Threshold</label>
               <select className="px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white shadow-sm outline-none w-full appearance-none text-center" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}>
                 <option>5 Stars</option>
                 <option>10 Stars</option>
               </select>
             </div>
          </div>
        )}

        <div className="border-t-2 border-slate-100 dark:border-slate-800/80 pt-6 mt-8 flex justify-between items-center">
            
            <div className="text-xs text-slate-400 font-medium">Unique ID: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px]">{question._id?.slice(-6) || question.tempId?.slice(-6)}</span></div>
            
            <label className="flex items-center gap-3 cursor-pointer group">
               <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">Required</span>
               <div className="relative inline-flex items-center h-7 rounded-full w-12 bg-slate-200 dark:bg-slate-700 transition-colors shadow-inner">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={question.required}
                    onChange={(e) => handleChange('required', e.target.checked)}
                  />
                  <div className="w-5 h-5 bg-white rounded-full absolute left-1 peer-checked:left-6 transition-all shadow-sm peer-checked:bg-primary border border-slate-200 peer-checked:border-primary/20"></div>
               </div>
            </label>
        </div>
      </div>
    </div>
  );
};

// Polyfill X icon just for this component
const X = ({size, strokeWidth}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default QuestionEditor;
