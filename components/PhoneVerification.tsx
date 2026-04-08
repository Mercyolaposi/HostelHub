'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, linkWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';

export default function PhoneVerification({ onVerified }: { onVerified?: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          // reCAPTCHA solved
        }
      });
    }
  }, []);

  const sendOTP = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }
    
    if (!auth.currentUser) {
      toast.error('You must be logged in to verify a phone number');
      return;
    }

    setIsLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      // Format should be +[country code][number]
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+233${phoneNumber.replace(/^0/, '')}`;
      
      const confirmation = await linkWithPhoneNumber(auth.currentUser, formattedNumber, appVerifier);
      setConfirmationResult(confirmation);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
      // Reset recaptcha if error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || !confirmationResult || !auth.currentUser) return;

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      
      // Update user document in Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        phoneNumber: result.user.phoneNumber,
        phoneVerified: true
      });

      toast.success('Phone number verified successfully!');
      if (onVerified) onVerified();
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-heading font-bold uppercase tracking-tighter mb-2">Verify Phone</h3>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Required for security</p>
      </div>
      <div id="recaptcha-container"></div>
      
      {!confirmationResult ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Phone Number</label>
            <input
              type="tel"
              placeholder="+233 54 123 4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-transparent border-b border-slate-300 py-3 text-lg font-medium outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300"
            />
          </div>
          <button 
            onClick={sendOTP} 
            disabled={isLoading}
            className="w-full group flex items-center justify-between bg-slate-900 text-white px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send OTP'}
            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Verification Code</label>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-transparent border-b border-slate-300 py-3 text-2xl tracking-[0.5em] font-heading font-bold outline-none focus:border-slate-900 transition-colors placeholder:text-slate-300 text-center"
              maxLength={6}
            />
          </div>
          <button 
            onClick={verifyOTP} 
            disabled={isLoading || otp.length < 6}
            className="w-full group flex items-center justify-between bg-slate-900 text-white px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      )}
    </div>
  );
}

// Add to global window object for TS
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
