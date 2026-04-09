'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setIsSent(true);
      toast.success('Password reset link sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white flex flex-col md:flex-row">
      {/* Left Side - Branding/Image */}
      <div className="w-full md:w-1/2 bg-slate-50 p-6 sm:p-10 md:p-16 lg:p-24 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-900">
        <div>
          <Link href="/login" className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-slate-900 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 md:mb-12 hover:bg-slate-900 hover:text-white transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Back to Login
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
            Reset <br/> Password.
          </h1>
          <p className="text-slate-500 max-w-sm text-sm md:text-base leading-relaxed">
            Enter your email address and we&apos;ll send you a link to securely reset your password.
          </p>
        </div>
        
        <div className="mt-12 md:mt-24 hidden sm:block">
          <div className="w-full h-px bg-slate-200 mb-6 md:mb-8"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Secure Account Recovery
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-16 lg:p-24 flex flex-col justify-center bg-white">
        <div className="max-w-md w-full mx-auto">
          {isSent ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-200">
                <MailCheck className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold uppercase tracking-tighter mb-2">Check Your Email</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                We&apos;ve sent a password reset link to your email address. Please check your inbox and spam folder.
              </p>
              <div className="pt-8">
                <button 
                  onClick={() => setIsSent(false)}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors border-b border-transparent hover:border-slate-900 pb-1"
                >
                  Didn&apos;t receive the email? Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-heading font-bold uppercase tracking-tighter mb-2">Forgot Password</h2>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Enter your email to receive a reset link</p>
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

                <div className="pt-4 md:pt-8">
                  <button 
                    type="submit" 
                    className="w-full group flex items-center justify-between bg-slate-900 text-white px-6 md:px-8 py-4 md:py-5 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                    {!isLoading && <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
