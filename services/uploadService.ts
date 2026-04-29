import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

export const uploadFileResized = async (file: File, path: string): Promise<string> => {
  try {
    let fileToUpload = file;

    // Only compress if it's an image
    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 1, // Compress to max 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      try {
        fileToUpload = await imageCompression(file, options);
      } catch (error) {
        console.warn('Image compression failed, using original file', error);
      }
    }

    // Set storage reference
    const storageRef = ref(storage, `${path}/${Date.now()}_${fileToUpload.name}`);

    // Upload the file
    const uploadTask = await uploadBytesResumable(storageRef, fileToUpload);
    
    // Return download URL
    return await getDownloadURL(uploadTask.ref);

  } catch (error: any) {
    console.error('Firebase storage upload error:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
};
