import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, BarChart3, Shield, Zap, ChevronRight, Code } from 'lucide-react';
import Logo from '../components/Logo';

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card p-8 rounded-3xl subtle-shadow border border-slate-100 dark:border-slate-800 hover:-translate-y-1 transition-transform duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
     <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
        {icon}
     </div>
     <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{title}</h3>
     <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Logo size="md" />
               <span className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">SurveyForge</span>
            </div>
            <div className="flex items-center gap-4">
               <Link to="/login" className="text-slate-600 dark:text-slate-300 font-medium hover:text-primary dark:hover:text-primary transition-colors px-4 py-2 hidden sm:block">
                 Sign In
               </Link>
               <Link to="/register" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full font-semibold hover-lift shadow-lg">
                 Get Started
               </Link>
            </div>
         </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-20">
         <div className="relative max-w-7xl mx-auto px-6">
            
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/20 dark:bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center mt-12 md:mt-24">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-sm mb-8 border border-blue-100 dark:border-blue-800/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  v1.0 Now Live - Free & Open Source
               </div>
               
               <h1 className="text-5xl md:text-7xl font-heading font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-8 max-w-4xl">
                  Build Dynamic Surveys <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">At Lightning Speed</span>
               </h1>
               
               <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mb-12 leading-relaxed">
                 SurveyForge is the ultimate open-source alternative for modern teams. Create beautiful forms, collect responses instantly, and analyze data in real-time.
               </p>
               
               <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
                  <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover-lift shadow-xl shadow-primary/30 flex items-center justify-center gap-2">
                     Start Building Free <ChevronRight size={20} />
                  </Link>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-full font-bold text-lg hover-lift shadow-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
                     <Code size={20} /> View Source
                  </a>
               </div>
            </div>
         </div>

         {/* Features Section */}
         <div className="max-w-7xl mx-auto px-6 mt-32 md:mt-48">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-4">Everything you need to gather insights</h2>
               <p className="text-slate-600 dark:text-slate-400">Powerful features built right into the core platform.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <FeatureCard 
                  icon={<Layout size={28} strokeWidth={2.5} />}
                  title="Intuitive Builder"
                  description="Drag and drop question types, rearrange them easily, and adjust settings via an elegant interface."
               />
               <FeatureCard 
                  icon={<Zap size={28} strokeWidth={2.5} />}
                  title="Dynamic Flow"
                  description="Changes are synced instantly. Experience zero latency when constructing massive complex forms."
               />
               <FeatureCard 
                  icon={<BarChart3 size={28} strokeWidth={2.5} />}
                  title="Real-time Analytics"
                  description="Watch responses pour in live via WebSocket integrations. Export data to CSV or PDF smoothly."
               />
               <FeatureCard 
                  icon={<Shield size={28} strokeWidth={2.5} />}
                  title="Secure & Private"
                  description="Securely share links with respondents. No data is harvested. You own exactly everything."
               />
            </div>
         </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-10 pb-8 mt-12">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-80">
               <Logo size="sm" />
               <span className="text-lg font-heading font-bold text-slate-800 dark:text-slate-200 tracking-tight">SurveyForge</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
               © {new Date().getFullYear()} SurveyForge. Open Source.
            </p>
         </div>
      </footer>
    </div>
  );
};

export default Landing;
