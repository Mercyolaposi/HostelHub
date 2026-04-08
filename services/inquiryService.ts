import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Inquiry } from '@/types';

export const createInquiry = async (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
  try {
    const docRef = await addDoc(collection(db, 'inquiries'), {
      ...inquiry,
      status: 'unread',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating inquiry:', error);
    throw new Error(error.message || 'Failed to send inquiry');
  }
};

export const getManagerInquiries = async (managerId: string) => {
  try {
    const q = query(
      collection(db, 'inquiries'),
      where('managerId', '==', managerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
  } catch (error: any) {
    console.error('Error getting inquiries:', error);
    throw new Error(error.message || 'Failed to get inquiries');
  }
};

export const updateInquiryStatus = async (inquiryId: string, status: 'unread' | 'read' | 'replied') => {
  try {
    await updateDoc(doc(db, 'inquiries', inquiryId), { status });
  } catch (error: any) {
    console.error('Error updating inquiry:', error);
    throw new Error(error.message || 'Failed to update inquiry');
  }
};
