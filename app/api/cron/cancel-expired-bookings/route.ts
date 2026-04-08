import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!admin.apps.length) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // Query for pending bookings that have expired
    const expiredBookingsQuery = db.collection('bookings')
      .where('status', '==', 'pending')
      .where('paymentStatus', '==', 'pending')
      .where('expiresAt', '<', now);

    const snapshot = await expiredBookingsQuery.get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, message: 'No expired bookings found.' });
    }

    const batch = db.batch();
    let cancelledCount = 0;

    for (const doc of snapshot.docs) {
      const bookingData = doc.data();
      const bookingRef = doc.ref;
      const roomRef = db.doc(`hostels/${bookingData.hostelId}/rooms/${bookingData.roomId}`);

      // We need to use a transaction to safely update the room's occupiedBeds,
      // but since we are processing potentially many bookings, we might prefer
      // to do it one by one or group them. For simplicity and reliability in a cron job,
      // we'll run a transaction for each expired booking.
      
      try {
        await db.runTransaction(async (transaction) => {
          const roomDoc = await transaction.get(roomRef);
          if (!roomDoc.exists) {
            // If room doesn't exist, just cancel the booking
            transaction.update(bookingRef, { status: 'cancelled' });
            return;
          }

          const roomData = roomDoc.data();
          const newOccupiedBeds = Math.max(0, (roomData?.occupiedBeds || 0) - 1);
          
          transaction.update(roomRef, {
            occupiedBeds: newOccupiedBeds,
            isAvailable: newOccupiedBeds < (roomData?.capacity || 1)
          });

          transaction.update(bookingRef, { status: 'cancelled' });
        });
        cancelledCount++;
      } catch (txError) {
        console.error(`Failed to cancel booking ${doc.id}:`, txError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully cancelled ${cancelledCount} expired bookings.` 
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
