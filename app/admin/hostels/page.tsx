'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAllHostels, updateHostelVerificationStatus } from '@/services/hostelService';
import { Hostel } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { MapPin, CheckCircle2, XCircle, ExternalLink, Home, Building2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminHostelVerificationsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (userData?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchHostels();
  }, [user, userData, router]);

  const fetchHostels = async () => {
    setIsLoading(true);
    try {
      const data = await getAllHostels();
      // Sort pending first
      data.sort((a, b) => {
        if (!a.isVerified && b.isVerified) return -1;
        if (a.isVerified && !b.isVerified) return 1;
        return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      });
      setHostels(data);
    } catch (error) {
      toast.error('Failed to load hostels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationUpdate = async (id: string, isVerified: boolean) => {
    try {
      await updateHostelVerificationStatus(id, isVerified);
      toast.success(`Hostel ${isVerified ? 'verified' : 'unverified'} successfully`);
      fetchHostels();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  if (!user || userData?.role !== 'admin') return null;

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16 border-b border-slate-900 pb-8 md:pb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-slate-900 tracking-tighter uppercase leading-none">
              Hostel <span className="text-slate-400">Verifications</span>
            </h1>
            <p className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-500">
              Review and authorize hostel listings for platform visibility
            </p>
          </div>
          <Link href="/admin/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-colors">
            Back to Dashboard
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-96 border border-slate-900 animate-pulse bg-slate-50"></div>
            ))}
          </div>
        ) : hostels.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-slate-200">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 italic">No hostels found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {hostels.map((hostel) => (
              <div key={hostel.id} className="border border-slate-900 group flex flex-col">
                {/* Status Header */}
                <div className={`p-4 border-b border-slate-900 flex items-center justify-between ${
                  !hostel.isVerified ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-900" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                      Hostel ID: {hostel.id?.slice(-8)}
                    </span>
                  </div>
                  <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-slate-900 ${
                    !hostel.isVerified ? 'bg-white text-yellow-600' : 'bg-slate-900 text-white'
                  }`}>
                    {hostel.isVerified ? 'Verified' : 'Pending Approval'}
                  </div>
                </div>

                {/* Image Gallery Preview */}
                <div className="relative h-64 w-full bg-slate-100 overflow-hidden border-b border-slate-900">
                  {hostel.images && hostel.images.length > 0 ? (
                    <Image
                      src={hostel.images[0]}
                      alt={hostel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-slate-200" />
                    </div>
                  )}
                  {hostel.images && hostel.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-900">
                      +{hostel.images.length - 1} More Photos
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-heading font-bold text-slate-900 uppercase tracking-tight mb-2">
                      {hostel.name}
                    </h3>
                    <div className="flex items-center text-slate-500 gap-1 mb-4">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{hostel.location}</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-6">
                      {hostel.address}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Distance</p>
                        <p className="text-sm font-bold text-slate-900">{hostel.distanceFromCampus}km from campus</p>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Amenities</p>
                        <p className="text-sm font-bold text-slate-900">{hostel.amenities?.length || 0} Listed</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                    <Link 
                      href={`/hostels/${hostel.id}`} 
                      target="_blank"
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-900 h-12 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      View Listing <ExternalLink className="w-3 h-3" />
                    </Link>
                    
                    {!hostel.isVerified ? (
                      <Button 
                        onClick={() => handleVerificationUpdate(hostel.id!, true)}
                        className="flex-1 bg-slate-900 text-white rounded-none h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800"
                      >
                        Approve Hostel
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleVerificationUpdate(hostel.id!, false)}
                        variant="outline"
                        className="flex-1 border-red-600 text-red-600 rounded-none h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50"
                      >
                        Revoke Approval
                      </Button>
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
