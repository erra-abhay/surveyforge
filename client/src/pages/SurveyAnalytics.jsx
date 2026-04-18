import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  MousePointerClick, 
  Loader2,
  RefreshCw,
  Share2,
  BarChart as BarChartIcon,
  X,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import api from '../utils/axios';
import socketService from '../utils/socket';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const AnalyticsCard = ({ title, value, icon, trend, borderClass, bgClass, iconClass }) => (
  <div className={`glass-card p-8 rounded-3xl subtle-shadow border-t-4 ${borderClass} relative overflow-hidden group`}>
     <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl transition-colors duration-500 pointer-events-none ${bgClass}`}></div>
     <div className="flex justify-between items-start relative z-10 w-full">
        <div>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{title}</h3>
          <p className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl shadow-inner ${iconClass}`}>{icon}</div>
     </div>
     {trend && (
       <div className={`mt-6 text-sm font-bold flex items-center gap-1 ${trend > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
         {trend > 0 ? '+' : ''}{trend}% from last week
       </div>
     )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{`${label}`}</p>
        <p className="text-xl text-primary font-black tracking-tight">{`Count: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const SurveyAnalytics = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionResponses, setQuestionResponses] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalPagination, setModalPagination] = useState({ page: 1, total: 0, pages: 1 });

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics/survey/${id}/overview`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
       console.error(err);
       setError('Failed to load analytics data.');
    } finally {
       setIsLoading(false);
    }
  };

  const fetchQuestionResponses = async (questionId, page = 1) => {
    try {
      setIsModalLoading(true);
      const res = await api.get(`/analytics/survey/${id}/question/${questionId}?page=${page}&limit=20`);
      if (res.data.success) {
        setQuestionResponses(page === 1 ? res.data.data.answers : [...questionResponses, ...res.data.data.answers]);
        setModalPagination(res.data.data.metadata);
      }
    } catch (err) {
      console.error('Failed to fetch question responses', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  const openQuestionModal = (question) => {
    setSelectedQuestion(question);
    setQuestionResponses([]);
    fetchQuestionResponses(question.questionId, 1);
  };

  const closeQuestionModal = () => {
    setSelectedQuestion(null);
    setQuestionResponses([]);
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get(`/analytics/${id}/export/csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `survey_${id}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Setup Real-time connection
    const socket = socketService.connect();
    socketService.joinRoom(id);

    const handleNewResponse = (newResponse) => {
       setIsUpdating(true);
       api.get(`/analytics/survey/${id}/overview`).then(res => {
         if (res.data.success) setData(res.data.data);
         setTimeout(() => setIsUpdating(false), 800);
       });
    };

    socketService.subscribe('response:new', handleNewResponse);

    return () => {
       socketService.unsubscribe('response:new', handleNewResponse);
       socketService.leaveRoom(id);
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Analytics Engine</p>
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500 font-bold relative">{error}</div>;
  }

  // Format daily trends
  const trendData = Object.entries(data.responsesOverTime || {}).map(([date, count]) => ({
     date: new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
     count
  }));

  return (
    <div className="py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <Link to="/dashboard" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors duration-300 shadow-sm shrink-0">
               <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
            <h1 className="text-3xl font-heading font-black text-slate-900 dark:text-white line-clamp-1 tracking-tight">{data.surveyTitle}</h1>
            {isUpdating && <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest rounded-full animate-pulse border border-primary/20 shrink-0"><RefreshCw size={12} className="animate-spin" /> Live Syncing</span>}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium pl-[56px]">Performance analytics overview and real-time form data.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto pl-[56px] md:pl-0">
          <button 
             onClick={handleExportCSV}
             className="flex-1 md:flex-none justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2"
          >
            Export CSV
          </button>
          <button 
             onClick={() => {
                 navigator.clipboard.writeText(`${window.location.origin}/s/${data.shareToken}`);
                 alert('Live share link copied to clipboard!');
             }}
             className="flex-1 md:flex-none justify-center bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-xl shadow-primary/30 flex items-center gap-2 hover-lift"
          >
            <Share2 size={18} strokeWidth={2.5} /> Share Link
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <AnalyticsCard 
          title="Total Responses" 
          value={data.overview.totalResponses} 
          icon={<Users size={32} strokeWidth={2} />} 
          trend={12} 
          borderClass="border-t-primary"
          bgClass="bg-primary/5 group-hover:bg-primary/10"
          iconClass="text-primary bg-primary/10"
        />
        <AnalyticsCard 
          title="Completion Rate" 
          value={`${data.overview.completionRate || 100}%`} 
          icon={<MousePointerClick size={32} strokeWidth={2} />} 
          borderClass="border-t-emerald-500"
          bgClass="bg-emerald-500/5 group-hover:bg-emerald-500/10"
          iconClass="text-emerald-500 bg-emerald-500/10"
        />
        <AnalyticsCard 
          title="Avg Time" 
          value={data.overview.averageCompletionTime ? `${Math.round(data.overview.averageCompletionTime / 1000)}s` : 'N/A'} 
          icon={<Clock size={32} strokeWidth={2} />} 
          borderClass="border-t-amber-500"
          bgClass="bg-amber-500/5 group-hover:bg-amber-500/10"
          iconClass="text-amber-500 bg-amber-500/10"
        />
        <AnalyticsCard 
          title="Source Devices" 
          value={`${Object.keys(data.overview.devices || {}).length}`} 
          icon={<BarChartIcon size={32} strokeWidth={2} />} 
          borderClass="border-t-purple-500"
          bgClass="bg-purple-500/5 group-hover:bg-purple-500/10"
          iconClass="text-purple-500 bg-purple-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Trend Graph */}
        <div className="glass-card p-8 rounded-3xl subtle-shadow lg:col-span-2">
           <h3 className="text-xl font-heading font-black text-slate-800 dark:text-white mb-2 tracking-tight">Responses Flux</h3>
           <p className="text-slate-500 text-sm font-medium mb-8">Daily rolling volume of incoming responses over time.</p>
           
           <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={trendData.length > 0 ? trendData : [{ date: 'Today', count: data.overview.totalResponses }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                      <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                         <stop offset="0%" stopColor="#3b82f6" />
                         <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={15} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dx={-10} allowDecimals={false} />
                   <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                   <Line type="monotone" dataKey="count" stroke="url(#colorLine)" strokeWidth={4} dot={{r: 5, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 8, strokeWidth: 0, fill: '#3b82f6'}} />
                 </LineChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* Device Breakdown */}
        <div className="glass-card p-8 rounded-3xl subtle-shadow flex flex-col items-center">
           <div className="w-full text-center">
             <h3 className="text-lg font-heading font-black text-slate-800 dark:text-white mb-2 tracking-tight">Telemetry Sources</h3>
           </div>
           
           <div className="h-48 w-full flex justify-center flex-1 my-8">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={Object.entries(data.overview.devices || { Desktop: 1 }).map(([name, value]) => ({ name: name.replace('unknown', 'Other'), value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {Object.keys(data.overview.devices || { Desktop: 1 }).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                 </PieChart>
               </ResponsiveContainer>
           </div>
           <div className="flex flex-wrap justify-center gap-3 w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              {Object.entries(data.overview.devices || { Desktop: 1 }).map(([name], idx) => (
                 <div key={name} className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <div className="w-3 h-3 rounded-md" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                    {name.charAt(0).toUpperCase() + name.slice(1).replace('unknown', 'Other')}
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Question Summaries */}
      <h3 className="text-2xl font-heading font-black text-slate-800 dark:text-white mb-8 tracking-tight mt-12">Question Matrix</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(data.questions || []).map((qData, index) => {
           let chartData = [];
           let isText = false;
           let textSamples = [];

           if (['multiple_choice', 'single_choice', 'yes_no', 'checkbox'].includes(qData.type)) {
              if (qData.analytics?.options) {
                 chartData = qData.analytics.options.map(o => ({ name: o.text || 'Untitled', value: o.count })).sort((a,b) => b.value - a.value).slice(0, 5);
              }
           } else if (qData.type === 'rating') {
              if (qData.analytics?.distribution) {
                 chartData = Object.entries(qData.analytics.distribution).map(([rating, count]) => ({ name: `${rating} Star`, value: count }));
              }
           } else if (['text', 'textarea', 'short_text', 'long_text'].includes(qData.type)) {
              isText = true;
              textSamples = qData.analytics?.sampleResponses || [];
           }
           
           return (
             <div key={qData.questionId} className="glass-card p-8 rounded-3xl subtle-shadow flex flex-col justify-between border-t border-slate-100 dark:border-slate-800">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm mb-4 shadow-sm">
                    Q{index + 1}
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {qData.questionText}
                  </h4>
                </div>
                
                {isText ? (
                   <div className="space-y-4 h-56 overflow-y-auto pr-2 custom-scrollbar border-t border-slate-100 dark:border-slate-800 pt-6">
                      {textSamples.length > 0 ? (
                        <>
                          {textSamples.map((text, i) => (
                             <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                               <span className="text-primary mr-1 opacity-50">"</span>{text}<span className="text-primary ml-1 opacity-50">"</span>
                             </div>
                          ))}
                          <button 
                            onClick={() => openQuestionModal(qData)}
                            className="w-full py-3 mt-2 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-dashed border-primary/20"
                          >
                             View All {qData.analytics?.totalAnswered} Submissions <ChevronRight size={14} />
                          </button>
                        </>
                      ) : (
                         <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest text-center">No textual insights captured yet.</div>
                      )}
                   </div>
                ) : chartData.length > 0 ? (
                  <div className="h-56 mt-auto border-t border-slate-100 dark:border-slate-800 pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 600}} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                           {chartData.map((entry, idx) => (
                             <Cell key={`cell-${idx}`} fill={`url(#barGradient-${idx})`} />
                           ))}
                        </Bar>
                        
                        <defs>
                           {chartData.map((_, idx) => (
                              <linearGradient key={`barGradient-${idx}`} id={`barGradient-${idx}`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={COLORS[idx % COLORS.length]} />
                                <stop offset="100%" stopColor={COLORS[(idx+1) % COLORS.length]} />
                              </linearGradient>
                           ))}
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 mt-auto border-t border-slate-100 dark:border-slate-800 pt-6 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                    Insufficient data volume
                  </div>
                )}
             </div>
           );
        })}
      </div>

      {/* Response Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeQuestionModal}></div>
           
           <div className="glass-card bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-3xl subtle-shadow relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-start">
                 <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">Question Insight</span>
                     <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">{selectedQuestion.analytics?.totalAnswered} Total Responses</span>
                   </div>
                   <h2 className="text-xl md:text-2xl font-heading font-black text-slate-900 dark:text-white leading-tight pr-8 italic">{selectedQuestion.questionText}</h2>
                 </div>
                 <button 
                   onClick={closeQuestionModal}
                   className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-slate-600 transition-all border border-slate-200 dark:border-slate-700 subtle-shadow mt-1"
                 >
                   <X size={20} />
                 </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar">
                 {questionResponses.map((ans, idx) => (
                    <div key={ans._id} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-colors group">
                       <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-xs font-black">#{modalPagination.total - (modalPagination.page - 1) * modalPagination.limit - idx}</div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(ans.createdAt).toLocaleString()}</span>
                          </div>
                          <MessageSquare size={14} className="text-slate-300 group-hover:text-primary/40 transition-colors" />
                       </div>
                       <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">{ans.value}</p>
                    </div>
                 ))}

                 {isModalLoading && (
                    <div className="flex justify-center p-8">
                       <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                 )}

                 {!isModalLoading && modalPagination.page < modalPagination.pages && (
                    <button 
                      onClick={() => fetchQuestionResponses(selectedQuestion.questionId, modalPagination.page + 1)}
                      className="w-full py-4 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border-2 border-dashed border-slate-200 dark:border-slate-800 mt-4"
                    >
                      Load More Responses
                    </button>
                 )}

                 {questionResponses.length === 0 && !isModalLoading && (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
                       <MessageSquare size={48} className="mb-4 opacity-10" />
                       <p className="font-bold uppercase tracking-widest text-sm">No recorded data for this query</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default SurveyAnalytics;
