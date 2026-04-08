import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Review } from '@/types';

export const submitReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
  try {
    // Add the review document
    const reviewRef = await addDoc(collection(db, `hostels/${review.hostelId}/reviews`), {
      ...review,
      createdAt: serverTimestamp(),
    });

    // Update the hostel's average rating
    const reviewsSnapshot = await getDocs(collection(db, `hostels/${review.hostelId}/reviews`));
    let totalRating = 0;
    let count = 0;
    
    reviewsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.rating) {
        totalRating += data.rating;
        count++;
      }
    });

    const newAverage = count > 0 ? totalRating / count : 0;
    
    const hostelRef = doc(db, 'hostels', review.hostelId);
    await updateDoc(hostelRef, {
      rating: newAverage
    });

    return reviewRef.id;
  } catch (error: any) {
    console.error('Error submitting review:', error);
    throw new Error(error.message || 'Failed to submit review');
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
