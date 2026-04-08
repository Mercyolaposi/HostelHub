import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Complaint } from '@/types';

export const submitComplaint = async (complaint: Omit<Complaint, 'id' | 'createdAt' | 'status'>) => {
  try {
    const docRef = await addDoc(collection(db, 'complaints'), {
      ...complaint,
      status: 'open',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error submitting complaint:', error);
    throw new Error(error.message || 'Failed to submit complaint');
  }
};

export const getStudentComplaints = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'complaints'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const complaints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    
    // Sort in frontend to avoid index requirement
    return complaints.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  } catch (error: any) {
    console.error('Error getting student complaints:', error);
    throw new Error(error.message || 'Failed to get complaints');
  }
};

export const getHostelComplaints = async (hostelId: string) => {
  try {
    const q = query(
      collection(db, 'complaints'),
      where('hostelId', '==', hostelId)
    );
    const querySnapshot = await getDocs(q);
    const complaints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    
    // Sort in frontend to avoid index requirement
    return complaints.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });
  } catch (error: any) {
    console.error('Error getting hostel complaints:', error);
    throw new Error(error.message || 'Failed to get complaints');
  }
};

export const getManagerComplaints = async (hostelIds: string[]) => {
  if (!hostelIds || hostelIds.length === 0) return [];
  
  try {
    const chunks = [];
    for (let i = 0; i < hostelIds.length; i += 30) {
      chunks.push(hostelIds.slice(i, i + 30));
    }

    const allComplaints: Complaint[] = [];
    
    for (const chunk of chunks) {
      const q = query(
        collection(db, 'complaints'),
        where('hostelId', 'in', chunk)
      );
      const querySnapshot = await getDocs(q);
      const complaints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
      allComplaints.push(...complaints);
    }
    
    allComplaints.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return dateB - dateA;
    });

    return allComplaints;
  } catch (error: any) {
    console.error('Error getting manager complaints:', error);
    throw new Error(error.message || 'Failed to get manager complaints');
  }
};

export const updateComplaintStatus = async (
  complaintId: string, 
  status: 'open' | 'in-progress' | 'resolved', 
  managerResponse?: string
) => {
  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    const updateData: any = { status };
    
    if (managerResponse) {
      updateData.managerResponse = managerResponse;
    }
    
    if (status === 'resolved') {
      updateData.resolvedAt = serverTimestamp();
    }
    
    await updateDoc(complaintRef, updateData);
  } catch (error: any) {
    console.error('Error updating complaint:', error);
    throw new Error(error.message || 'Failed to update complaint');
  }
};
