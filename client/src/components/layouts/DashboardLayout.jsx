import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  BarChart3, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu,
  X,
  Plus
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Logo from '../Logo';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Surveys', icon: BarChart3, path: '/surveys' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950 flex flex-col md:flex-row font-sans selection:bg-primary/20">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="font-black text-slate-900 dark:text-white font-heading text-xl tracking-tight">SurveyForge</span>
        </div>
        <button className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 w-[240px] bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
        transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-50
        flex flex-col shadow-2xl shadow-slate-200/20 dark:shadow-none h-full
      `}>
        <div className="flex items-center justify-between p-5 mb-1">
          <div className="flex items-center gap-2.5">
            <Logo size="md" />
            <span className="font-black text-slate-900 dark:text-white font-heading text-lg tracking-tight">SurveyForge</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setSidebarOpen(false)}>
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-5 mb-8">
           <button 
              onClick={async () => {
                 try {
                   const { default: api } = await import('../../utils/axios');
                   const res = await api.post('/surveys', {
                      title: 'Untitled Survey',
                      description: '',
                      questions: [{ text: 'Untitled Question', type: 'short_text', required: false }]
                   });
                   if (res.data.success) {
                     navigate(`/builder/${res.data.data.survey._id}`);
                     setSidebarOpen(false);
                   }
                 } catch (error) {
                    console.error(error);
                 }
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white flex-shrink-0 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover-lift shadow-lg shadow-primary/25 transition-all"
           >
              <Plus size={16} strokeWidth={3} /> Create Survey
           </button>
        </div>

        <div className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group relative overflow-hidden
                ${isActive 
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>}
                  <item.icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-3 p-2 rounded-xl mb-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => navigate('/settings')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold uppercase shrink-0 shadow-inner text-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto w-full animate-fade-in pb-12">
             {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
