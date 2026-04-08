'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useManagerDashboard } from '@/hooks/useDashboard';
import { updateInquiryStatus } from '@/services/inquiryService';
import { toast } from 'sonner';
import { ArrowLeft, Mail, CheckCircle2, Clock } from 'lucide-react';

export default function ManagerInquiriesPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { inquiries, isLoading, mutateInquiries } = useManagerDashboard(user?.uid);

  useEffect(() => {
    if (!user || userData?.role !== 'manager') {
      router.push('/');
    }
  }, [user, userData, router]);

  const handleUpdateStatus = async (id: string, status: 'read' | 'replied') => {
    try {
      await updateInquiryStatus(id, status);
      toast.success(`Inquiry marked as ${status}`);
      mutateInquiries();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  if (isLoading) return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-6 md:py-8">
        <div className="max-w-[1400px] mx-auto">
          <button 
            onClick={() => router.push('/manager/dashboard')} 
            className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-8 md:mb-12">
          Inquiries.
        </h1>

        {inquiries.length === 0 ? (
          <div className="border border-slate-900 p-10 md:p-12 text-center bg-slate-50">
            <Mail className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">No inquiries received yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className={`border border-slate-900 p-6 md:p-8 transition-all ${inquiry.status === 'unread' ? 'bg-slate-50' : 'bg-white'}`}>
                <div className="flex flex-col lg:flex-row justify-between gap-6 md:gap-8">
                  <div className="flex-1 space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border border-slate-900 ${
                        inquiry.status === 'unread' ? 'bg-slate-900 text-white' : 
                        inquiry.status === 'read' ? 'bg-slate-200 text-slate-600 border-slate-300' : 
                        'bg-green-100 text-green-700 border-green-200'
                      }`}>
                        {inquiry.status}
                      </span>
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                        {inquiry.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider mb-1 md:mb-2">{inquiry.subject}</h3>
                      <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest break-all">From: {inquiry.studentName} ({inquiry.studentEmail})</p>
                    </div>

                    <div className="bg-white border border-slate-200 p-4 md:p-6 text-xs md:text-sm text-slate-600 leading-relaxed italic">
                      &quot;{inquiry.message}&quot;
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-3 justify-start lg:justify-start">
                    {inquiry.status === 'unread' && (
                      <button 
                        onClick={() => handleUpdateStatus(inquiry.id!, 'read')}
                        className="flex-1 lg:flex-none px-4 md:px-6 py-3 bg-white border border-slate-900 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    {inquiry.status !== 'replied' && (
                      <button 
                        onClick={() => handleUpdateStatus(inquiry.id!, 'replied')}
                        className="flex-1 lg:flex-none px-4 md:px-6 py-3 bg-slate-900 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
                      >
                        Mark Replied
                      </button>
                    )}
                    {inquiry.status === 'replied' && (
                      <div className="flex items-center gap-2 text-green-600 text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 md:px-6 py-3">
                        <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Replied
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
