'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginUser } from '@/services/authService';
import { toast } from 'sonner';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { userData } = await loginUser(data.email, data.password);
      toast.success('Login successful!');
      
      // Redirect based on role and verification
      if (!userData.phoneVerified) {
        router.push('/verify-phone');
      } else if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (userData.role === 'manager') {
        router.push('/manager/dashboard');
      } else {
        router.push('/');
      }
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white flex flex-col md:flex-row">
      {/* Left Side - Branding/Image */}
      <div className="w-full md:w-1/2 bg-slate-50 p-6 sm:p-10 md:p-16 lg:p-24 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-900">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-slate-900 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 md:mb-12">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-900"></span>
            CUG Hostels
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
            Welcome <br/> Back.
          </h1>
          <p className="text-slate-500 max-w-sm text-sm md:text-base leading-relaxed">
            Sign in to access your dashboard, manage your bookings, or list your properties on the platform.
          </p>
        </div>
        
        <div className="mt-12 md:mt-24 hidden sm:block">
          <div className="w-full h-px bg-slate-200 mb-6 md:mb-8"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Secure Access to Your Account
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-16 lg:p-24 flex flex-col justify-center bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold uppercase tracking-tighter mb-2">Login</h2>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Enter your credentials below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Email Address</label>
              <input 
                id="email" 
                type="email" 
                placeholder="m.doe@cug.edu.gh" 
                {...register('email')}
                className="w-full bg-transparent border-b border-slate-300 py-3 text-base md:text-lg font-medium outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300 rounded-none"
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Password</label>
                <Link href="/forgot-password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-transparent border-b border-slate-300 py-3 pr-10 text-base md:text-lg font-medium outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300 rounded-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors p-2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tight">{errors.password.message}</p>}
            </div>

            <div className="pt-4 md:pt-8">
              <button 
                type="submit" 
                className="w-full group flex items-center justify-between bg-slate-900 text-white px-6 md:px-8 py-4 md:py-5 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
                {!isLoading && <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 text-center">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-slate-900 border-b border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
