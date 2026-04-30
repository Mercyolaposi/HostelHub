import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase-errors';

export const getAdminStats = async () => {
  const path = 'users/bookings/hostels';
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;
    let students = 0;
    let managers = 0;
    
    usersSnapshot.forEach(doc => {
      const role = doc.data().role;
      if (role === 'student') students++;
      if (role === 'manager') managers++;
    });

    // Get all bookings
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
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
    const hostelsSnapshot = await getDocs(collection(db, 'hostels'));
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
    handleFirestoreError(error, OperationType.LIST, path);
  }
};
