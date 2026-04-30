'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAdminAnalytics } from '@/services/analyticsService';
import { toast } from 'sonner';
import { ArrowLeft, DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function AdminAnalytics() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userData && userData.role !== 'admin') {
      router.push('/');
      return;
    }
    
    if (userData?.role === 'admin') {
      fetchAnalytics();
    }
  }, [userData, router]);

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await getAdminAnalytics();
      setData(analyticsData);
    } catch (error: any) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return null;

  const pieData = [
    { name: 'Paid', value: data.paidBookings },
    { name: 'Unpaid', value: data.unpaidBookings }
  ];
  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-12 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <button 
            onClick={() => router.push('/admin/dashboard')} 
            className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors mb-6 md:mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back to Dashboard
          </button>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
            Revenue <br/> Analytics.
          </h1>
          <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 max-w-xl">
            Global financial overview and performance metrics.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-slate-900 mb-16">
          <div className="p-8 border-r border-b border-slate-900 bg-slate-900 text-white">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-5 h-5 text-slate-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Revenue</h3>
            </div>
            <p className="text-4xl md:text-5xl font-heading font-bold tracking-tighter">
              GH₵{data.totalRevenue.toLocaleString()}
            </p>
          </div>
          
          <div className="p-8 border-r border-b border-slate-900 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Bookings</h3>
            </div>
            <p className="text-4xl md:text-5xl font-heading font-bold tracking-tighter">
              {data.totalBookings}
            </p>
          </div>

          <div className="p-8 border-r border-b border-slate-900 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-green-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Paid Bookings</h3>
            </div>
            <p className="text-4xl md:text-5xl font-heading font-bold tracking-tighter text-green-600">
              {data.paidBookings}
            </p>
          </div>

          <div className="p-8 border-r border-b border-slate-900 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unpaid Bookings</h3>
            </div>
            <p className="text-4xl md:text-5xl font-heading font-bold tracking-tighter text-amber-600">
              {data.unpaidBookings}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="border border-slate-900 p-6 md:p-8">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-8">Revenue Over Time</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `GH₵${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 0, border: '1px solid #0f172a', boxShadow: 'none' }}
                    formatter={(value: any) => [`GH₵${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} dot={{ r: 4, fill: '#0f172a' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border border-slate-900 p-6 md:p-8">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-8">Top Performing Hostels</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topHostels} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `GH₵${val}`} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#0f172a', fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 0, border: '1px solid #0f172a', boxShadow: 'none' }}
                    formatter={(value: any) => [`GH₵${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Managers Table */}
        <div className="border border-slate-900">
          <div className="p-6 md:p-8 border-b border-slate-900 bg-slate-50">
            <h3 className="text-lg font-bold uppercase tracking-wider">Manager Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-50">
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Manager</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Hostels</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Bookings</th>
                  <th className="p-4 md:p-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {data.managersData.map((manager: any) => (
                  <tr key={manager.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-4 md:p-6 text-sm font-bold">{manager.name}</td>
                    <td className="p-4 md:p-6 text-sm text-slate-600">{manager.totalHostels}</td>
                    <td className="p-4 md:p-6 text-sm text-slate-600">{manager.totalBookings}</td>
                    <td className="p-4 md:p-6 text-sm font-bold text-green-600">GH₵{manager.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
                {data.managersData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                      No manager data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
