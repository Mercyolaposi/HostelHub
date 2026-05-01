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

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
      throw new Error('Cloudinary configuration is missing');
    }

    // 1. Get the signature from the backend
    const signResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder: path }),
    });

    if (!signResponse.ok) {
      const errorData = await signResponse.json().catch(() => ({}));
      throw new Error(`Upload authentication failed: ${errorData.error || signResponse.statusText}. Please contact support if this persists.`);
    }

    const { signature, timestamp } = await signResponse.json();

    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', path);

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || uploadResponse.statusText}. Please try a different file. `);
    }

    const uploadData = await uploadResponse.json();
    return uploadData.secure_url;

  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
};
