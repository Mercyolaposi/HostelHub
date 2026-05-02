'use server';

import { adminDb } from '@/lib/firebase-admin';

export const getAdminStats = async () => {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();
    const totalUsers = usersSnapshot.size;
    let students = 0;
    let managers = 0;
    
    usersSnapshot.forEach(doc => {
      const role = doc.data().role;
      if (role === 'student') students++;
      if (role === 'manager') managers++;
    });

    // Get all bookings
    const bookingsSnapshot = await adminDb.collection('bookings').get();
    const totalBookings = bookingsSnapshot.size;
    let confirmedBookings = 0;
    let totalRevenue = 0;

    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'confirmed' || data.paymentStatus === 'paid') {
        confirmedBookings++;
        totalRevenue += data.amount || 0;
      }
    });

    // Get all hostels
    const hostelsSnapshot = await adminDb.collection('hostels').get();
    const totalHostels = hostelsSnapshot.size;
    let verifiedHostels = 0;

    hostelsSnapshot.forEach(doc => {
      if (doc.data().isVerified) {
        verifiedHostels++;
      }
    });

    return {
      users: {
        total: totalUsers,
        students,
        managers
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings
      },
      hostels: {
        total: totalHostels,
        verified: verifiedHostels
      },
      revenue: {
        total: totalRevenue
      }
    };
  } catch (error: any) {
    console.error('Failed to resolve admin stats', error);
    throw new Error(error.message);
  }
};
