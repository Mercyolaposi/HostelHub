'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useManagerDashboard } from '@/hooks/useDashboard';
import { updateInquiryStatus } from '@/services/inquiryService';
import Link from 'next/link';
import { Users, CreditCard, Home, TrendingUp, MessageCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function ManagerDashboard() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { 
    hostels, 
    bookings, 
    complaints, 
    inquiries, 
    rooms, 
    verificationStatus, 
    isLoading: dashboardLoading, 
    mutateInquiries 
  } = useManagerDashboard(user?.uid);
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (userData?.role !== 'manager') {
      router.push('/');
      return;
    }
  }, [user, userData, router]);

  const isLoading = dashboardLoading;
  const isVerified = verificationStatus?.status === 'verified';

  if (!user || userData?.role !== 'manager') return null;

  // Calculate Stats
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupied = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const activeBookings = bookings.filter(b => b.status !== 'cancelled').length;
  const unreadInquiries = inquiries.filter(i => i.status === 'unread').length;

  const handleMarkAsRead = async (inquiryId: string) => {
    try {
      await updateInquiryStatus(inquiryId, 'read');
      mutateInquiries();
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-12 md:py-24">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-slate-900 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-900"></span>
              Manager Portal
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter leading-[0.9]">
              Dashboard.
            </h1>
            <p className="text-slate-500 font-medium text-base md:text-lg max-w-md">
              Welcome back, {user.displayName || user.email}. Manage your properties, bookings, and inquiries.
            </p>
          </div>
          
          {isVerified && (
            <Link 
              href="/manager/hostels/new" 
              className="w-full md:w-auto group flex items-center justify-between bg-slate-900 text-white px-6 py-4 md:px-8 md:py-5 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition-all"
            >
              Add New Hostel
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !isVerified ? (
          <div className="border border-amber-500 bg-amber-50 p-6 md:p-12 mb-12">
            <h2 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter text-amber-900 mb-4">Verification Required</h2>
            <p className="text-sm md:text-base text-amber-800 mb-8 max-w-2xl leading-relaxed">
              You must verify your identity and property ownership before you can list hostels. This ensures a safe environment for our students.
            </p>
            <Link 
              href="/manager/verify" 
              className="inline-block bg-amber-600 text-white px-8 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition-colors"
            >
              Complete Verification
            </Link>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-0 border border-slate-900">
              <div className="p-4 md:p-8 border-b border-r border-slate-900">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <h3 className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Revenue</h3>
                  <CreditCard className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                </div>
                <p className="text-xl md:text-3xl font-heading font-bold tracking-tighter">GH₵{totalRevenue.toLocaleString()}</p>
              </div>

              <div className="p-4 md:p-8 border-b lg:border-b-0 border-r border-slate-900">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <h3 className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Occupancy</h3>
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                </div>
                <p className="text-xl md:text-3xl font-heading font-bold tracking-tighter">{occupancyRate}%</p>
              </div>

              <div className="p-4 md:p-8 border-b sm:border-b-0 border-r lg:border-r border-slate-900">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <h3 className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Bookings</h3>
                  <Users className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                </div>
                <p className="text-xl md:text-3xl font-heading font-bold tracking-tighter">{activeBookings}</p>
              </div>

              <div className="p-4 md:p-8 border-r border-slate-900">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <h3 className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Hostels</h3>
                  <Home className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                </div>
                <p className="text-xl md:text-3xl font-heading font-bold tracking-tighter">{hostels.length}</p>
              </div>

              <div className="p-4 md:p-8 bg-slate-50 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <h3 className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Unread</h3>
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                </div>
                <p className="text-xl md:text-3xl font-heading font-bold tracking-tighter text-slate-900">{unreadInquiries}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
              <div className="lg:col-span-8 space-y-12 md:space-y-16">
                {/* Properties Section */}
                <div>
                  <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-slate-900 pb-4">
                    <h2 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter">Your Properties</h2>
                  </div>
                  
                  {hostels.length === 0 ? (
                    <div className="border border-dashed border-slate-400 p-8 md:p-12 text-center bg-slate-50">
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">You haven&apos;t added any hostels yet.</p>
                      <Link 
                        href="/manager/hostels/new" 
                        className="inline-block border border-slate-900 px-6 py-3 md:px-8 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors"
                      >
                        Add Your First Hostel
                      </Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                      {hostels.map(hostel => (
                        <div key={hostel.id} className="border border-slate-900 flex flex-col group hover:bg-slate-50 transition-colors">
                          <div className="h-40 md:h-48 bg-slate-100 relative border-b border-slate-900">
                            {hostel.images?.[0] ? (
                              <Image 
                                src={hostel.images[0]} 
                                alt={hostel.name} 
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400">No Image</div>
                            )}
                            <div className="absolute top-3 right-3 md:top-4 md:right-4">
                              {hostel.isVerified ? (
                                <span className="bg-white border border-slate-900 text-slate-900 px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Verified</span>
                              ) : (
                                <span className="bg-slate-900 text-white px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Pending</span>
                              )}
                            </div>
                          </div>
                          <div className="p-4 md:p-6 flex-1 flex flex-col">
                            <h3 className="text-lg md:text-xl font-heading font-bold uppercase tracking-tighter mb-1 md:mb-2 line-clamp-1">{hostel.name}</h3>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 md:mb-8 line-clamp-1">{hostel.location}</p>
                            
                            <Link 
                              href={`/manager/hostels/${hostel.id}`} 
                              className="mt-auto w-full border border-slate-900 py-3 md:py-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors"
                            >
                              Manage Property
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Inquiries Section */}
                <div>
                  <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-slate-900 pb-4">
                    <h2 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter">Guest Inquiries</h2>
                    <Link 
                      href="/manager/inquiries" 
                      className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  
                  {inquiries.length === 0 ? (
                    <div className="border border-slate-200 p-8 md:p-12 text-center bg-slate-50">
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">No inquiries yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 md:space-y-6">
                      {inquiries.slice(0, 3).map((inquiry) => {
                        const hostel = hostels.find(h => h.id === inquiry.hostelId);
                        return (
                          <div key={inquiry.id} className={`border p-5 md:p-8 ${inquiry.status === 'unread' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 md:gap-4 mb-4 md:mb-6">
                              <div>
                                <h3 className="font-bold uppercase tracking-wider text-base md:text-lg mb-1 md:mb-2">{inquiry.studentName}</h3>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
                                  <a href={`mailto:${inquiry.studentEmail}`} className="hover:text-slate-900 transition-colors break-all">{inquiry.studentEmail}</a>
                                </div>
                                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 mt-3 md:mt-4">
                                  Regarding: <span className="text-slate-900">{hostel?.name || 'Unknown Hostel'}</span>
                                </p>
                              </div>
                              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 shrink-0">
                                {inquiry.createdAt?.toDate ? inquiry.createdAt.toDate().toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                            
                            <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-wrap mb-4 md:mb-6 line-clamp-2 italic">&quot;{inquiry.message}&quot;</p>
                            
                            {inquiry.status === 'unread' && (
                              <div className="pt-4 md:pt-6 border-t border-slate-200 flex justify-end">
                                <button 
                                  className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest border-b border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors"
                                  onClick={() => handleMarkAsRead(inquiry.id!)}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                  Mark as Read
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Complaints Section */}
                <div>
                  <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-slate-900 pb-4">
                    <h2 className="text-xl md:text-2xl font-heading font-bold uppercase tracking-tighter">Recent Complaints</h2>
                    <Link 
                      href="/manager/complaints" 
                      className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  
                  {complaints.length === 0 ? (
                    <div className="border border-slate-200 p-8 md:p-12 text-center bg-slate-50">
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">No complaints yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 md:space-y-6">
                      {complaints.slice(0, 3).map((complaint) => {
                        const hostel = hostels.find(h => h.id === complaint.hostelId);
                        return (
                          <div key={complaint.id} className="border border-slate-200 p-5 md:p-8 bg-white">
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                              <div>
                                <h3 className="font-bold uppercase tracking-wider text-base md:text-lg mb-1">{complaint.title}</h3>
                                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">{hostel?.name || 'Unknown Hostel'}</p>
                              </div>
                              <span className={`px-2 py-0.5 md:px-2 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border ${
                                complaint.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-200' : 
                                complaint.status === 'in-progress' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                                'bg-amber-50 text-amber-600 border-amber-200'
                              }`}>
                                {complaint.status}
                              </span>
                            </div>
                            <p className="text-slate-600 text-xs md:text-sm leading-relaxed line-clamp-2">{complaint.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar: Recent Bookings */}
              <div className="lg:col-span-4">
                <div className="border border-slate-900 sticky top-24">
                  <div className="p-4 md:p-6 border-b border-slate-900 bg-slate-50">
                    <h2 className="text-lg md:text-xl font-heading font-bold uppercase tracking-tighter">Recent Bookings</h2>
                  </div>
                  <div className="p-4 md:p-6">
                    {bookings.length === 0 ? (
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 text-center py-6 md:py-8">No bookings yet.</p>
                    ) : (
                      <div className="space-y-4 md:space-y-6">
                        {bookings.slice(0, 5).map(booking => {
                          const hostel = hostels.find(h => h.id === booking.hostelId);
                          return (
                            <div key={booking.id} className="flex justify-between items-center border-b border-slate-200 pb-4 md:pb-6 last:border-0 last:pb-0">
                              <div>
                                <p className="font-bold uppercase tracking-wider text-xs md:text-sm mb-1 line-clamp-1">{hostel?.name || 'Unknown Hostel'}</p>
                                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">GH₵{booking.amount}</p>
                              </div>
                              <span className={`px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest border shrink-0 ${
                                booking.paymentStatus === 'paid' ? 'border-green-500 text-green-600 bg-green-50' :
                                booking.paymentStatus === 'pending' ? 'border-amber-500 text-amber-600 bg-amber-50' :
                                'border-red-500 text-red-600 bg-red-50'
                              }`}>
                                {booking.paymentStatus}
                              </span>
                            </div>
                          );
                        })}
                        <Link 
                          href="/manager/bookings"
                          className="block w-full border border-slate-900 py-3 md:py-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors mt-4"
                        >
                          View All Bookings
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

