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

    // Query for pending bookings that have expired, limit to 50 to prevent function timeouts
    const expiredBookingsQuery = db.collection('bookings')
      .where('status', '==', 'pending')
      .where('paymentStatus', '==', 'pending')
      .where('expiresAt', '<', now)
      .limit(50);

    const snapshot = await expiredBookingsQuery.get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, message: 'No expired bookings found.' });
    }

    let cancelledCount = 0;

    // Process in chunks of 10 to balance concurrency and connection limits
    const chunkSize = 10;
    for (let i = 0; i < snapshot.docs.length; i += chunkSize) {
      const chunk = snapshot.docs.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (doc) => {
        const bookingData = doc.data();
        const bookingRef = doc.ref;
        const roomRef = db.doc(`hostels/${bookingData.hostelId}/rooms/${bookingData.roomId}`);

        try {
          await db.runTransaction(async (transaction) => {
            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists) {
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
      }));
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
