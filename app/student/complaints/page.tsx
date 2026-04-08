'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { submitComplaint } from '@/services/complaintService';
import { useStudentDashboard } from '@/hooks/useDashboard';
import { Complaint, Hostel } from '@/types';
import { toast } from 'sonner';
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const complaintSchema = z.object({
  hostelId: z.string().min(1, 'Please select a hostel'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export default function StudentComplaints() {
  const { user } = useAuth();
  const { bookings, complaints, isLoading, mutateComplaints } = useStudentDashboard(user?.uid);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    hostelId: '',
    title: '',
    description: ''
  });

  const hostels = useMemo(() => {
    if (!bookings) return [];
    const uniqueHostels = new Map();
    bookings.forEach(b => {
      if (b.hostel && !uniqueHostels.has(b.hostelId)) {
        uniqueHostels.set(b.hostelId, { id: b.hostelId, name: b.hostel.name });
      }
    });
    return Array.from(uniqueHostels.values());
  }, [bookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrors({});

    try {
      const validatedData = complaintSchema.parse(formData);

      setIsSubmitting(true);
      await submitComplaint({
        userId: user.uid,
        hostelId: validatedData.hostelId,
        title: validatedData.title,
        description: validatedData.description
      });

      toast.success('Complaint submitted successfully');
      setFormData({ hostelId: '', title: '', description: '' });
      
      // Refresh complaints using SWR mutate
      mutateComplaints();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Please fix the errors in the form.');
      } else {
        toast.error(error.message || 'Failed to submit complaint');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-none mb-6">
            My <br/> Complaints.
          </h1>
          <p className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-500 max-w-xl">
            Submit and track issues with your hostel. We aim to resolve all issues promptly.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Submit Form */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 border border-slate-900 p-8">
              <h2 className="text-2xl font-heading font-bold uppercase tracking-tighter mb-8">Submit Issue</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Hostel</label>
                  <select 
                    className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all appearance-none rounded-none"
                    value={formData.hostelId} 
                    onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                  >
                    <option value="" disabled>Select hostel</option>
                    {hostels.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                    {hostels.length === 0 && (
                      <option value="none" disabled>No booked hostels found</option>
                    )}
                  </select>
                  {errors.hostelId && <p className="text-xs text-red-500 mt-1">{errors.hostelId}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Subject</label>
                  <input 
                    type="text"
                    placeholder="E.g., Broken AC in Room 101" 
                    className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                  <textarea 
                    placeholder="Describe the issue in detail..." 
                    className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all min-h-[120px] resize-y placeholder:text-slate-300 rounded-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-slate-900 text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed mt-8"
                  disabled={isSubmitting || hostels.length === 0}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </form>
            </div>
          </div>

          {/* History */}
          <div className="lg:col-span-8">
            <h2 className="text-3xl font-heading font-bold uppercase tracking-tighter mb-8">History</h2>
            
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-slate-100 animate-pulse border border-slate-200"></div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-24 border border-slate-900 bg-slate-50">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-6" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No complaints submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="border border-slate-900 p-6 md:p-8 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-wider mb-2">{complaint.title}</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                          {complaint.createdAt?.toDate ? complaint.createdAt.toDate().toLocaleString() : 'Recently'}
                        </p>
                      </div>
                      <div>
                        {complaint.status === 'open' && (
                          <span className="inline-flex items-center px-3 py-1 border border-amber-500 text-amber-600 text-xs font-bold uppercase tracking-widest bg-amber-50">
                            <AlertCircle className="w-3 h-3 mr-2" /> Open
                          </span>
                        )}
                        {complaint.status === 'in-progress' && (
                          <span className="inline-flex items-center px-3 py-1 border border-blue-500 text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50">
                            <Clock className="w-3 h-3 mr-2" /> In Progress
                          </span>
                        )}
                        {complaint.status === 'resolved' && (
                          <span className="inline-flex items-center px-3 py-1 border border-green-500 text-green-600 text-xs font-bold uppercase tracking-widest bg-green-50">
                            <CheckCircle2 className="w-3 h-3 mr-2" /> Resolved
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="prose prose-sm max-w-none text-slate-600 mb-6 border-l-2 border-slate-200 pl-4">
                      <p className="whitespace-pre-wrap">{complaint.description}</p>
                    </div>

                    {complaint.managerResponse && (
                      <div className="bg-slate-900 text-white p-6 mt-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Manager Response</h4>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.managerResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

