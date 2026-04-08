import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface ManagerVerification {
  id?: string;
  userId: string;
  idDocumentUrl: string;
  propertyProofUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: any;
  updatedAt?: any;
  adminNotes?: string;
}

export const submitVerification = async (
  userId: string,
  idDocumentFile: File,
  propertyProofFile: File
) => {
  try {
    // 1. Upload ID Document
    const idDocRef = ref(storage, `manager_documents/${userId}/id_${Date.now()}_${idDocumentFile.name}`);
    await uploadBytes(idDocRef, idDocumentFile);
    const idDocumentUrl = await getDownloadURL(idDocRef);

    // 2. Upload Property Proof
    const propProofRef = ref(storage, `manager_documents/${userId}/prop_${Date.now()}_${propertyProofFile.name}`);
    await uploadBytes(propProofRef, propertyProofFile);
    const propertyProofUrl = await getDownloadURL(propProofRef);

    // 3. Create Verification Document
    const verificationData = {
      userId,
      idDocumentUrl,
      propertyProofUrl,
      status: 'pending',
      submittedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'managerVerifications'), verificationData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error submitting verification:', error);
    throw new Error(error.message || 'Failed to submit verification');
  }
};

export const getManagerVerificationStatus = async (userId: string) => {
  try {
    const q = query(collection(db, 'managerVerifications'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the most recent one if there are multiple
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManagerVerification));
    docs.sort((a, b) => b.submittedAt?.toMillis() - a.submittedAt?.toMillis());
    return docs[0];
  } catch (error: any) {
    console.error('Error getting verification status:', error);
    throw new Error(error.message || 'Failed to get verification status');
  }
};

export const getAllVerifications = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'managerVerifications'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManagerVerification));
  } catch (error: any) {
    console.error('Error getting all verifications:', error);
    throw new Error(error.message || 'Failed to get verifications');
  }
};

export const updateVerificationStatus = async (verificationId: string, status: 'verified' | 'rejected', adminNotes?: string) => {
  try {
    const verificationRef = doc(db, 'managerVerifications', verificationId);
    await updateDoc(verificationRef, {
      status,
      adminNotes: adminNotes || '',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating verification status:', error);
    throw new Error(error.message || 'Failed to update verification status');
  }
};
