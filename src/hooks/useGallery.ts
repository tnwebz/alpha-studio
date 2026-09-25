import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getSampleImagesForCategory } from '../data/sampleImages';

export function useGallery(category: string) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    let isSubscribed = true;

    // Dynamically load category sample images only when category is requested
    getSampleImagesForCategory(category).then((sampleUrls) => {
      if (!isSubscribed) return;

      const docRef = doc(db, 'galleries', category);
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (!isSubscribed) return;
          if (docSnap.exists()) {
            const data = docSnap.data();
            const firestoreUrls: string[] = Array.isArray(data.urls) ? data.urls : [];
            const filteredSamples = sampleUrls.filter((url) => !firestoreUrls.includes(url));
            // Cloudinary uploaded images ALWAYS come first!
            setImages([...firestoreUrls, ...filteredSamples]);
          } else {
            setImages(sampleUrls);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Firestore subscription error:", error);
          if (isSubscribed) {
            setImages(sampleUrls);
            setLoading(false);
          }
        }
      );

      return () => {
        unsubscribe();
      };
    });

    return () => {
      isSubscribed = false;
    };
  }, [category]);

  const addImages = useCallback(async (urls: string[]) => {
    if (!category || urls.length === 0) return;
    
    const docRef = doc(db, 'galleries', category);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const existingUrls = docSnap.data().urls || [];
      const updatedUrls = [...urls, ...existingUrls];
      await updateDoc(docRef, { urls: updatedUrls });
    } else {
      await setDoc(docRef, { urls: urls });
    }
  }, [category]);

  const removeImage = useCallback(async (url: string) => {
    if (!category || !url) return;
    
    const docRef = doc(db, 'galleries', category);
    await updateDoc(docRef, {
      urls: arrayRemove(url)
    });
  }, [category]);

  return { images, loading, addImages, removeImage };
}
