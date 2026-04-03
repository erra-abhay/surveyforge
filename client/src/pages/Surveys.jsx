import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Edit2, Play, Users, BarChart, Trash2, Copy, Settings } from 'lucide-react';
import api from '../utils/axios';

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const surveysRes = await api.get('/surveys/my?limit=50');
      if (surveysRes.data.success) {
        setSurveys(surveysRes.data.data.surveys);
      }
    } catch (error) {
      console.error('Failed to load surveys', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/surveys/${id}/duplicate`);
      fetchData();
      setActiveMenu(null);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this survey? All responses will be lost.")) return;
    try {
      await api.delete(`/surveys/${id}`);
      fetchData();
      setActiveMenu(null);
    } catch (e) { console.error(e); }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-3 py-1.5 bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-green-200/50 dark:border-green-800/30"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> ACTIVE</span>;
      case 'draft':
        return <span className="px-3 py-1.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">DRAFT</span>;
      case 'closed':
        return <span className="px-3 py-1.5 bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-200/50 dark:border-amber-800/30">CLOSED</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Registry</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-slate-900 dark:text-white mb-1 tracking-tight">Survey Registry</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage, duplicate, and analyze all survey frames in your fleet.</p>
        </div>
      </div>

      {surveys.length === 0 ? (
        <div className="glass-card rounded-2xl border-dashed border-2 border-slate-200 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center bg-transparent">
           <div className="w-14 h-14 bg-primary/10 dark:bg-primary/5 rounded-full flex items-center justify-center mb-4 text-primary shadow-inner">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
           </div>
           <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Registry is clear</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-center font-medium">Head back to the dashboard to deploy your first survey frame into the field.</p>
           <Link to="/dashboard" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2.5 px-6 text-sm rounded-xl transition-all hover-lift shadow-lg shadow-slate-900/20 dark:shadow-white/10">
              Return to Dashboard
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {surveys.map(survey => (
            <div key={survey._id} className="glass-card bg-white dark:bg-slate-900 rounded-2xl p-5 subtle-shadow hover-lift group border border-slate-200/60 dark:border-slate-800/80 relative overflow-visible transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 flex flex-col">
              
              <div className="flex justify-between items-start mb-4 relative">
                {getStatusBadge(survey.status)}
                
                <div className="relative z-10">
                  <button 
                     onClick={() => setActiveMenu(activeMenu === survey._id ? null : survey._id)}
                     className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {activeMenu === survey._id && (
                     <div className="absolute top-10 right-0 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in py-1 font-medium">
                        <Link to={`/builder/${survey._id}`} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"><Settings size={16} /> Configuration</Link>
                        <button onClick={() => handleDuplicate(survey._id)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"><Copy size={16} /> Duplicate Frame</button>
                        <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                        <button onClick={() => handleDelete(survey._id)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 size={16} /> Terminate Record</button>
                     </div>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1.5 line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
                {survey.title || 'Untitled Survey'}
              </h3>
              
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-5 line-clamp-2 min-h-[32px]">
                {survey.description || 'No meta description bound to this matrix frame.'}
              </p>

              <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                  <Users size={14} className="text-primary" />
                  <span>{survey.stats?.totalResponses || 0}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Link 
                    to={`/builder/${survey._id}`}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-300 hover:text-white hover:bg-primary transition-all duration-300 shadow-sm"
                    title="Engage Builder"
                  >
                    <Edit2 size={16} strokeWidth={2.5} />
                  </Link>
                  <Link 
                    to={`/analytics/${survey._id}`}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-300 hover:text-white hover:bg-emerald-500 transition-all duration-300 shadow-sm"
                    title="Engage Analytics Dashboard"
                  >
                    <BarChart size={16} strokeWidth={2.5} />
                  </Link>
                  {survey.status === 'active' && (
                    <div className="flex bg-primary/10 dark:bg-primary/20 rounded-lg group/link border border-primary/20 dark:border-primary/10 overflow-hidden shadow-sm">
                      <a 
                        href={`/s/${survey.shareToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                        title="Broadcast Sandbox"
                      >
                        <Play size={16} strokeWidth={2.5} />
                      </a>
                      <div className="w-px bg-primary/20"></div>
                      <button 
                        onClick={() => {
                           navigator.clipboard.writeText(`${window.location.origin}/s/${survey.shareToken}`);
                           alert('Encrypted link token cloned to clipboard!');
                        }}
                        className="p-2 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                        title="Copy Broadcast Link Token"
                      >
                         <Copy size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Surveys;
