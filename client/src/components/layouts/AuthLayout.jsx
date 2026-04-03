import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import Logo from '../Logo';

const data = [
  { val: 10 }, { val: 25 }, { val: 20 }, { val: 40 }, { val: 35 }, { val: 50 }, { val: 65 }
];

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex selection:bg-primary/30">
      
      {/* Left Pane - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 bg-white dark:bg-slate-950 relative z-10">
        
        {/* Subtle glowing blurs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3"></div>

        <div className="w-full max-w-[420px] relative z-20 animate-fade-in">
          
          <div className="mb-10 text-center lg:text-left">
             <div className="inline-flex items-center gap-3 mb-8">
                <Logo size="lg" />
                <h1 className="text-3xl font-heading font-black tracking-tight text-slate-900 dark:text-white">SurveyForge</h1>
             </div>
             
             <h2 className="text-3xl lg:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{title}</h2>
             <p className="text-base text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
          </div>

          {children}

        </div>
      </div>

      {/* Right Pane - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-slate-50 dark:bg-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden border-l border-slate-200 dark:border-slate-800">
        
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="relative z-10 w-full max-w-[500px]">
           {/* Glow behind widget */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

           <div className="glass-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl subtle-shadow border-4 border-white dark:border-slate-800 relative z-20 hover:-translate-y-2 transition-transform duration-500">
             <div className="h-48 mb-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#2563eb" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
             <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-6">
               <div>
                 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Live Form Insights</p>
                 <p className="text-4xl font-heading font-black text-slate-800 dark:text-white tracking-tight">1,204</p>
               </div>
               <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full text-xs font-bold shadow-sm">
                 +14.5% Today
               </div>
             </div>
           </div>

           <div className="mt-16 text-center space-y-4">
             <h3 className="text-3xl font-heading font-black text-slate-900 dark:text-white leading-tight">
               Build surveys people <br/>actually want to take.
             </h3>
             <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto">
               Collect better data with conversational UI, advanced logic, and live analytics.
             </p>
           </div>

        </div>
      </div>
      
    </div>
  );
};

export default AuthLayout;
