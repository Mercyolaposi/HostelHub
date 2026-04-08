import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, serverTimestamp, getDoc, orderBy, collectionGroup } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Hostel, Room, Review } from '@/types';

export const createHostel = async (managerId: string, hostelData: Partial<Hostel>, imageFiles: File[]) => {
  try {
    // 1. Upload images
    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      const imageRef = ref(storage, `hostel_images/${managerId}/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      imageUrls.push(url);
    }

    // 2. Create Hostel Document
    const newHostel: Omit<Hostel, 'id'> = {
      managerId,
      name: hostelData.name!,
      location: hostelData.location!,
      address: hostelData.address!,
      distanceFromCampus: Number(hostelData.distanceFromCampus) || 0,
      amenities: hostelData.amenities || [],
      images: imageUrls,
      rating: 0,
      isVerified: false, // Requires admin approval
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'hostels'), newHostel);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating hostel:', error);
    throw new Error(error.message || 'Failed to create hostel');
  }
};

export const getManagerHostels = async (managerId: string) => {
  try {
    const q = query(collection(db, 'hostels'), where('managerId', '==', managerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hostel));
  } catch (error: any) {
    console.error('Error getting manager hostels:', error);
    throw new Error(error.message || 'Failed to get hostels');
  }
};

export const getAllVerifiedHostels = async () => {
  try {
    const q = query(collection(db, 'hostels'), where('isVerified', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hostel));
  } catch (error: any) {
    console.error('Error getting verified hostels:', error);
    throw new Error(error.message || 'Failed to get hostels');
  }
};

export const getAllVerifiedHostelsWithRooms = async () => {
  try {
    const hostels = await getAllVerifiedHostels();
    if (hostels.length === 0) return [];

    // Optimize: Fetch all rooms using collectionGroup in one go
    const roomsSnapshot = await getDocs(collectionGroup(db, 'rooms'));
    const allRooms = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));

    // Group rooms by hostelId
    const roomsByHostel: Record<string, Room[]> = {};
    allRooms.forEach(room => {
      if (!roomsByHostel[room.hostelId]) {
        roomsByHostel[room.hostelId] = [];
      }
      roomsByHostel[room.hostelId].push(room);
    });

    return hostels.map(hostel => ({
      ...hostel,
      rooms: roomsByHostel[hostel.id!] || []
    }));
  } catch (error: any) {
    console.error('Error getting hostels with rooms:', error);
    throw new Error(error.message || 'Failed to get hostels with rooms');
  }
};
export const getHostelById = async (hostelId: string) => {
  try {
    const docRef = doc(db, 'hostels', hostelId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Hostel;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting hostel:', error);
    throw new Error(error.message || 'Failed to get hostel');
  }
};

export const addRoomToHostel = async (hostelId: string, roomData: Partial<Room>) => {
  try {
    const newRoom: Omit<Room, 'id'> = {
      hostelId,
      roomNumber: roomData.roomNumber!,
      type: roomData.type!,
      pricePerSemester: Number(roomData.pricePerSemester),
      capacity: Number(roomData.capacity),
      occupiedBeds: 0,
      isAvailable: true,
    };

    const docRef = await addDoc(collection(db, `hostels/${hostelId}/rooms`), newRoom);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding room:', error);
    throw new Error(error.message || 'Failed to add room');
  }
};

export const getHostelRooms = async (hostelId: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, `hostels/${hostelId}/rooms`));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
  } catch (error: any) {
    console.error('Error getting rooms:', error);
    throw new Error(error.message || 'Failed to get rooms');
  }
};

export const getManagerRooms = async (managerId: string) => {
  try {
    // Optimization: Use collectionGroup to get all rooms
    // Then filter by managerId if needed, or just rely on the fact that 
    // we only care about rooms belonging to hostels the manager owns.
    // Since rooms have hostelId, we can filter them.
    const roomsSnapshot = await getDocs(collectionGroup(db, 'rooms'));
    const allRooms = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
    
    // We need to know which hostels belong to the manager to filter rooms
    const managerHostels = await getManagerHostels(managerId);
    const managerHostelIds = new Set(managerHostels.map(h => h.id));
    
    return allRooms.filter(room => managerHostelIds.has(room.hostelId));
  } catch (error: any) {
    console.error('Error getting manager rooms:', error);
    throw new Error(error.message || 'Failed to get manager rooms');
  }
};

export const updateRoom = async (hostelId: string, roomId: string, roomData: Partial<Room>) => {
  try {
    const docRef = doc(db, `hostels/${hostelId}/rooms`, roomId);
    await updateDoc(docRef, roomData);
  } catch (error: any) {
    console.error('Error updating room:', error);
    throw new Error(error.message || 'Failed to update room');
  }
};

export const deleteRoom = async (hostelId: string, roomId: string) => {
  try {
    const docRef = doc(db, `hostels/${hostelId}/rooms`, roomId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error('Error deleting room:', error);
    throw new Error(error.message || 'Failed to delete room');
  }
};

export const addReview = async (hostelId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) => {
  try {
    const newReview = {
      ...reviewData,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, `hostels/${hostelId}/reviews`), newReview);
    
    // Update hostel rating
    const reviews = await getHostelReviews(hostelId);
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + reviewData.rating;
    const newRating = totalRating / (reviews.length + 1);
    
    await updateDoc(doc(db, 'hostels', hostelId), { rating: newRating });
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding review:', error);
    throw new Error(error.message || 'Failed to add review');
  }
};

export const getHostelReviews = async (hostelId: string) => {
  try {
    const q = query(collection(db, `hostels/${hostelId}/reviews`), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error: any) {
    console.error('Error getting reviews:', error);
    throw new Error(error.message || 'Failed to get reviews');
  }
};
