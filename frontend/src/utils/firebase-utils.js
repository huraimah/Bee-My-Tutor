import { ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';

export const uploadWithRetry = async (file, path, metadata, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      return uploadTask;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
};