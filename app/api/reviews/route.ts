import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function POST(req: Request) {
  if (!adminDb || !adminAuth) {
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if verified (email_verified or phone)
    if (!decodedToken.email_verified && !decodedToken.phone_number) {
      return NextResponse.json({ error: 'You must be verified to post reviews.' }, { status: 403 });
    }

    const data = await req.json();
    const { hostelId, userId, userName, comment, rating } = data;

    if (userId !== decodedToken.uid) {
       return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    if (!hostelId || !userId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const path = `hostels/${hostelId}/reviews`;
    
    // Create the review
    const reviewData = {
      hostelId,
      userId,
      userName: userName || 'Anonymous',
      comment: comment || '',
      rating: Number(rating),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const reviewRef = await adminDb.collection(path).add(reviewData);

    // Calculate new average using Aggregation
    const reviewsCollection = adminDb.collection(path);
    const aggregateQuery = reviewsCollection.aggregate({
      totalRating: admin.firestore.AggregateField.sum('rating'),
      count: admin.firestore.AggregateField.count(),
    });

    const aggregateSnapshot = await aggregateQuery.get();
    const totalRating = aggregateSnapshot.data().totalRating || 0;
    const count = aggregateSnapshot.data().count || 0;
    
    const newAverage = count > 0 ? totalRating / count : 0;

    // Update the hostel doc
    await adminDb.collection('hostels').doc(hostelId).update({
      rating: newAverage,
    });

    return NextResponse.json({ success: true, reviewId: reviewRef.id, newAverage });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
