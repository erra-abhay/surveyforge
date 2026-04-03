import React, { useState, useEffect } from 'react';
import { User, Lock, Moon, Sun, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../utils/axios';

const Settings = () => {
  const { user, setUser } = useAuthStore();
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setIsDarkMode(document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark');
  }, [user]);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setProfileMsg({ type: 'error', text: 'Name cannot be empty' });
    
    try {
      setIsUpdatingProfile(true);
      setProfileMsg({ type: '', text: '' });
      const res = await api.patch('/auth/profile', { name });
      if (res.data.success) {
         setUser(res.data.data.user);
         setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });
    
    if (newPassword !== confirmPassword) {
       return setPwdMsg({ type: 'error', text: 'New passwords do not match' });
    }
    
    try {
      setIsUpdatingPwd(true);
      const res = await api.patch('/auth/change-password', { currentPassword, newPassword });
      if (res.data.success) {
         setPwdMsg({ type: 'success', text: 'Password successfully changed!' });
         setCurrentPassword('');
         setNewPassword('');
         setConfirmPassword('');
      }
    } catch (err) {
      let errTxt = err.response?.data?.message || 'Failed to change password';
      if (err.response?.data?.errors?.length > 0) {
         errTxt = err.response.data.errors[0].msg;
      }
      setPwdMsg({ type: 'error', text: errTxt });
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  return (
    <div className="pb-8">
      <div className="mb-6 pl-1">
        <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-1">Account Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Column: Profile & Prefs */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Card */}
            <div className="glass-card p-5 md:p-6 rounded-2xl subtle-shadow border-t-4 border-t-primary relative overflow-hidden bg-white dark:bg-slate-900">
               <div className="flex items-center gap-2.5 mb-5">
                 <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0"><User size={18} /></div>
                 <h2 className="text-lg font-heading font-bold text-slate-800 dark:text-white">Profile Information</h2>
               </div>
               
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl uppercase shrink-0 shadow-inner">
                     {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                     <h3 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                     <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs">{user?.email}</p>
                     <span className="inline-block mt-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] rounded-full font-bold tracking-wide shadow-sm">
                        {user?.role?.toUpperCase()} ACCOUNT
                     </span>
                  </div>
               </div>

               <form className="space-y-4" onSubmit={handleUpdateProfile}>
                  <div>
                     <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Display Name</label>
                     <input 
                       type="text" 
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full px-4 py-2.5 text-sm rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-0 outline-none transition-all text-slate-700 dark:text-white font-medium"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                     <input 
                       type="email" 
                       value={user?.email || ''} 
                       disabled
                       className="w-full px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none font-medium"
                     />
                  </div>
                  
                  {profileMsg.text && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${profileMsg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30'}`}>
                       {profileMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                       {profileMsg.text}
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                     <button type="submit" disabled={isUpdatingProfile} className="bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2.5 px-6 rounded-lg transition-all hover-lift flex items-center gap-2 shadow-md shadow-primary/20">
                        {isUpdatingProfile && <Loader2 size={14} className="animate-spin" />}
                        {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                     </button>
                  </div>
               </form>
            </div>

            {/* Security Settings */}
            <div className="glass-card p-5 md:p-6 rounded-2xl subtle-shadow border-t-4 border-t-emerald-500 bg-white dark:bg-slate-900">
               <div className="flex items-center gap-2.5 mb-6">
                 <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0"><Lock size={18} /></div>
                 <h2 className="text-lg font-heading font-bold text-slate-800 dark:text-white">Change Password</h2>
               </div>

               <form className="space-y-4" onSubmit={handleChangePassword}>
                  <div>
                     <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                     <input 
                       type="password" 
                       value={currentPassword}
                       onChange={(e) => setCurrentPassword(e.target.value)}
                       required
                       className="w-full px-4 py-2.5 text-sm rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all text-slate-700 dark:text-white font-medium"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password <span className="text-[10px] text-slate-400 font-normal ml-1">(Min 8 chars, 1 uppercase, 1 number)</span></label>
                     <input 
                       type="password" 
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                       required
                       className="w-full px-4 py-2.5 text-sm rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all text-slate-700 dark:text-white font-medium"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                     <input 
                       type="password" 
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       required
                       className="w-full px-4 py-2.5 text-sm rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-0 outline-none transition-all text-slate-700 dark:text-white font-medium"
                     />
                  </div>

                  {pwdMsg.text && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${pwdMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30'}`}>
                       {pwdMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                       {pwdMsg.text}
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                     <button type="submit" disabled={isUpdatingPwd} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 px-6 rounded-lg transition-all hover-lift flex items-center gap-2 shadow-md shadow-emerald-500/20">
                        {isUpdatingPwd && <Loader2 size={14} className="animate-spin" />}
                        {isUpdatingPwd ? 'Authenticating...' : 'Update Password'}
                     </button>
                  </div>
               </form>
            </div>
         </div>

         {/* Right Column: Mini Settings */}
         <div className="space-y-6">
            
            {/* Preferences */}
            <div className="glass-card p-5 md:p-6 rounded-2xl subtle-shadow h-max bg-white dark:bg-slate-900 border-t-4 border-t-indigo-500">
               <div className="flex items-center gap-2.5 mb-6">
                 <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg shrink-0"><Moon size={18} /></div>
                 <h2 className="text-lg font-heading font-bold text-slate-800 dark:text-white">Preferences</h2>
               </div>
               
               <div className="space-y-5">
                  <div className="flex items-center justify-between">
                     <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Dark Theme</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Easier on the eyes</p>
                     </div>
                     <button 
                        onClick={toggleTheme}
                        className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors focus:outline-none ${isDarkMode ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                     >
                        <span className={`inline-block w-5 h-5 bg-white rounded-full transition-transform shadow flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}>
                           {isDarkMode && <Moon size={10} className="text-indigo-500" strokeWidth={3} />}
                           {!isDarkMode && <Sun size={10} className="text-amber-500" strokeWidth={3} />}
                        </span>
                     </button>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                     <div className="flex items-center justify-between opacity-40 cursor-not-allowed" title="Coming in a future update">
                        <div>
                           <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Email Alerts</h4>
                           <p className="text-xs text-slate-500 mt-0.5">Updates on responses</p>
                        </div>
                        <div className="relative inline-flex items-center h-7 rounded-full w-12 bg-slate-200 dark:bg-slate-800">
                           <span className="inline-block w-5 h-5 bg-slate-50 dark:bg-slate-700 rounded-full translate-x-1 shadow-sm"></span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;
