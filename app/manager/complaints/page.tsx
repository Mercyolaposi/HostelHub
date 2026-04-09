'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateComplaintStatus } from '@/services/complaintService';
import { useManagerDashboard } from '@/hooks/useDashboard';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManagerComplaints() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { complaints, hostels, isLoading, mutateComplaints } = useManagerDashboard(user?.uid);
  
  const [selectedHostelId, setSelectedHostelId] = useState<string>('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<'pending' | 'in-progress' | 'resolved'>('in-progress');
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || userData?.role !== 'manager') {
      router.push('/');
    }
  }, [user, userData, router]);

  const handleRespond = async (complaintId: string) => {
    setIsSubmitting(true);
    try {
      await updateComplaintStatus(complaintId, responseStatus, responseText);
      toast.success('Response submitted successfully');
      
      const complaint = complaints.find(c => c.id === complaintId);
      if (complaint) {
        // Send notification
        try {
          // Fetch user's email
          const userDoc = await getDoc(doc(db, 'users', complaint.userId));
          const userEmail = userDoc.exists() ? userDoc.data().email : 'student@example.com';
          const token = await user!.getIdToken();

          await fetch('/api/notify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              type: 'alert',
              to: {
                email: userEmail, 
              },
              data: {
                message: `Your complaint "${complaint.title}" has been updated to ${responseStatus}. Manager says: ${responseText}`
              }
            })
          });
        } catch (notifyError) {
          console.error('Failed to send notification:', notifyError);
        }
      }

      mutateComplaints();
      setRespondingTo(null);
      setResponseText('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredComplaints = selectedHostelId === 'all' 
    ? complaints 
    : complaints.filter(c => c.hostelId === selectedHostelId);

  if (isLoading) return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-12 md:py-24">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div>
            <button 
              onClick={() => router.push('/manager/dashboard')} 
              className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors mb-6 md:mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back to Dashboard
            </button>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
              Student <br/> Complaints.
            </h1>
            <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 max-w-xl">
              Manage and respond to issues raised by students.
            </p>
          </div>
          
          {hostels.length > 0 && (
            <div className="w-full md:w-64">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Filter by Hostel</label>
              <select 
                className="w-full bg-transparent border-b border-slate-900 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-b-2 transition-all appearance-none rounded-none"
                value={selectedHostelId} 
                onChange={(e) => setSelectedHostelId(e.target.value)}
              >
                <option value="all">All Hostels</option>
                {hostels.map(h => (
                  <option key={h.id} value={h.id!}>{h.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-16 md:py-24 border border-slate-900 bg-slate-50">
            <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-4 md:mb-6" />
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">No complaints found.</p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {filteredComplaints.map((complaint) => {
              const hostel = hostels.find(h => h.id === complaint.hostelId);
              
              return (
                <div key={complaint.id} className="border border-slate-900 p-6 md:p-8 hover:bg-slate-50 transition-colors bg-white">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 md:mb-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider">{complaint.title}</h3>
                        <span className="border border-slate-900 text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 md:px-3 md:py-1">
                          {hostel?.name || 'Unknown Hostel'}
                        </span>
                      </div>
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
                        Submitted by: {complaint.userId.substring(0, 8)}... on {complaint.createdAt?.toDate ? complaint.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {complaint.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 border border-amber-500 text-amber-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest bg-amber-50">
                          <AlertCircle className="w-3 h-3 mr-1.5 md:mr-2" /> Pending
                        </span>
                      )}
                      {complaint.status === 'in-progress' && (
                        <span className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 border border-blue-500 text-blue-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest bg-blue-50">
                          <Clock className="w-3 h-3 mr-1.5 md:mr-2" /> In Progress
                        </span>
                      )}
                      {complaint.status === 'resolved' && (
                        <span className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 border border-green-500 text-green-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest bg-green-50">
                          <CheckCircle2 className="w-3 h-3 mr-1.5 md:mr-2" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6 md:mb-8">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 md:mb-3">Message</h4>
                    <div className="prose prose-sm max-w-none text-slate-600 border-l-2 border-slate-200 pl-4 text-xs md:text-sm">
                      <p className="whitespace-pre-wrap leading-relaxed">{complaint.message}</p>
                    </div>
                  </div>
                  
                  {complaint.managerResponse && respondingTo !== complaint.id && (
                    <div className="bg-slate-900 text-white p-4 md:p-6 mb-6 md:mb-8">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 md:mb-3">Your Response</h4>
                      <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{complaint.managerResponse}</p>
                    </div>
                  )}

                  {respondingTo === complaint.id ? (
                    <div className="border border-slate-900 p-4 md:p-6 bg-white space-y-6">
                      <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Update Status & Respond</h4>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</label>
                        <select 
                          className="w-full md:w-64 bg-transparent border-b border-slate-900 py-3 text-xs focus:outline-none focus:border-b-2 transition-all appearance-none rounded-none"
                          value={responseStatus} 
                          onChange={(e: any) => setResponseStatus(e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Response</label>
                        <textarea 
                          placeholder="Type your response to the student..." 
                          className="w-full bg-transparent border-b border-slate-900 py-3 text-xs focus:outline-none focus:border-b-2 transition-all min-h-[100px] resize-y placeholder:text-slate-300 rounded-none"
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-end pt-4">
                        <button 
                          className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest border border-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
                          onClick={() => setRespondingTo(null)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button 
                          className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400"
                          onClick={() => handleRespond(complaint.id!)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Response'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end border-t border-slate-200 pt-4 md:pt-6">
                      <button 
                        className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest border border-slate-900 hover:bg-slate-50 transition-colors"
                        onClick={() => {
                          setRespondingTo(complaint.id!);
                          setResponseStatus(complaint.status);
                          setResponseText(complaint.managerResponse || '');
                        }}
                      >
                        {complaint.managerResponse ? 'Edit Response' : 'Respond'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

