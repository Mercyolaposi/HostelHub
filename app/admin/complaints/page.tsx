'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAllComplaints, updateComplaintStatus, deleteComplaint } from '@/services/complaintService';
import { Complaint } from '@/types';
import { toast } from 'sonner';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, ArrowLeft, Trash2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminComplaints() {
  const { user, userData } = useAuth();
  const router = useRouter();
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (userData && userData.role !== 'admin') {
      router.push('/');
      return;
    }
    
    if (userData?.role === 'admin') {
      fetchComplaints();
    }
  }, [userData, router]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await getAllComplaints();
      setComplaints(data);
    } catch (error: any) {
      toast.error('Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    setIsSubmitting(complaintId);
    try {
      await updateComplaintStatus(complaintId, newStatus);
      toast.success('Status updated successfully');
      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
    } catch (error: any) {
      toast.error('Failed to update status');
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleToggleVisibility = async (complaintId: string, currentVisibility: boolean) => {
    setIsSubmitting(complaintId);
    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        adminVisible: !currentVisibility
      });
      toast.success(currentVisibility ? 'Complaint hidden from managers' : 'Complaint visible to managers');
      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, adminVisible: !currentVisibility } : c));
    } catch (error: any) {
      toast.error('Failed to update visibility');
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleDelete = async (complaintId: string) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) return;
    
    setIsSubmitting(complaintId);
    try {
      await deleteComplaint(complaintId);
      toast.success('Complaint deleted successfully');
      setComplaints(prev => prev.filter(c => c.id !== complaintId));
    } catch (error: any) {
      toast.error('Failed to delete complaint');
    } finally {
      setIsSubmitting(null);
    }
  };

  const filteredComplaints = filterStatus === 'all' 
    ? complaints 
    : complaints.filter(c => c.status === filterStatus);

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
              onClick={() => router.push('/admin/dashboard')} 
              className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors mb-6 md:mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back to Dashboard
            </button>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
              System <br/> Complaints.
            </h1>
            <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 max-w-xl">
              Monitor, override, and manage all complaints across the platform.
            </p>
          </div>
          
          <div className="w-full md:w-64">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Filter by Status</label>
            <select 
              className="w-full bg-transparent border-b border-slate-900 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-b-2 transition-all appearance-none rounded-none"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-16 md:py-24 border border-slate-900 bg-slate-50">
            <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-4 md:mb-6" />
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">No complaints found.</p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className={`border border-slate-900 p-6 md:p-8 transition-colors ${!complaint.adminVisible ? 'bg-slate-50 opacity-75' : 'bg-white'}`}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 md:mb-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider">{complaint.title}</h3>
                      <span className="border border-slate-900 text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 md:px-3 md:py-1">
                        Hostel ID: {complaint.hostelId.substring(0, 8)}...
                      </span>
                      {!complaint.adminVisible && (
                        <span className="bg-red-100 text-red-600 border border-red-200 text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 md:px-3 md:py-1">
                          Hidden from Manager
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
                      Student ID: {complaint.userId.substring(0, 8)}... | Manager ID: {complaint.managerId.substring(0, 8)}... | Date: {complaint.createdAt?.toDate ? complaint.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <select 
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border focus:outline-none ${
                        complaint.status === 'resolved' ? 'border-green-500 text-green-600 bg-green-50' :
                        complaint.status === 'in-progress' ? 'border-blue-500 text-blue-600 bg-blue-50' :
                        'border-amber-500 text-amber-600 bg-amber-50'
                      }`}
                      value={complaint.status}
                      onChange={(e: any) => handleUpdateStatus(complaint.id!, e.target.value)}
                      disabled={isSubmitting === complaint.id}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-6 md:mb-8">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 md:mb-3">Message</h4>
                  <div className="prose prose-sm max-w-none text-slate-600 border-l-2 border-slate-200 pl-4 text-xs md:text-sm">
                    <p className="whitespace-pre-wrap leading-relaxed">{complaint.message}</p>
                  </div>
                </div>
                
                {complaint.managerResponse && (
                  <div className="bg-slate-100 text-slate-900 p-4 md:p-6 mb-6 md:mb-8 border border-slate-200">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 md:mb-3">Manager Response</h4>
                    <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{complaint.managerResponse}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 md:pt-6">
                  <button 
                    className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    onClick={() => handleToggleVisibility(complaint.id!, complaint.adminVisible)}
                    disabled={isSubmitting === complaint.id}
                  >
                    {complaint.adminVisible ? (
                      <><EyeOff className="w-3.5 h-3.5" /> Hide from Manager</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5" /> Show to Manager</>
                    )}
                  </button>
                  <button 
                    className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    onClick={() => handleDelete(complaint.id!)}
                    disabled={isSubmitting === complaint.id}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}