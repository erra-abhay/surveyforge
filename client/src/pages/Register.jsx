import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import AuthLayout from '../components/layouts/AuthLayout';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await register(name, email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Start creating beautiful surveys today."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50 flex animate-fade-in shadow-sm">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
               <User size={18} />
            </div>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-0 focus:border-primary transition-all outline-none font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
               <Mail size={18} />
            </div>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-0 focus:border-primary transition-all outline-none font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
               <Lock size={18} />
            </div>
            <input 
              type={showPassword ? 'text' : 'password'} 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-0 focus:border-primary transition-all outline-none font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/40 flex justify-center items-center mt-6"
        >
          {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-5 bg-white dark:bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-xs">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors font-bold text-slate-700 dark:text-slate-300">
            GitHub
         </button>
         <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors font-bold text-slate-700 dark:text-slate-300">
            Google
         </button>
      </div>

      <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 mt-8">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
