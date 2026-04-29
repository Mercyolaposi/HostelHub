import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Review } from '@/types';
import { handleFirestoreError } from '@/lib/firebase-errors';

export const submitReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
  const path = `hostels/${review.hostelId}/reviews`;
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to submit review');
    }

    const data = await response.json();
    return data.reviewId;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('{')) throw error;
    handleFirestoreError(error, 'write', path);
  }
};

export const getHostelReviews = async (hostelId: string) => {
  try {
    const q = query(
      collection(db, `hostels/${hostelId}/reviews`),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error: any) {
    console.error('Error getting reviews:', error);
    throw new Error(error.message || 'Failed to get reviews');
  }
};
