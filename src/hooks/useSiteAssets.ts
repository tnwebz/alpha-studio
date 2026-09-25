import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SiteAssets {
  heroSlides?: string[]; // Array of Cloudinary URLs for the 4 slides
  shootBackground?: string; // Cloudinary URL for ShootSection
  contactBackground?: string; // Cloudinary URL for ContactSection
  serviceCovers?: Record<string, string>; // category slug -> Cloudinary URL
  galleryCovers?: Record<string, string>; // category key -> Cloudinary URL
  aboutPhotos?: Record<string, string>; // 'alwin' | 'x' -> Cloudinary URL
}

const STORAGE_KEY = 'alpha_site_assets';
const ASSETS_DOC_REF = doc(db, 'settings', 'site_assets');

export function useSiteAssets() {
  const [assets, setAssets] = useState<SiteAssets>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      ASSETS_DOC_REF,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as SiteAssets;
          setAssets(data || {});
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
          } catch (e) {
            console.warn('LocalStorage error:', e);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore site_assets subscription notice:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateHeroSlide = useCallback(async (index: number, url: string) => {
    const currentSlides = [...(assets.heroSlides || [])];
    currentSlides[index] = url;
    await setDoc(ASSETS_DOC_REF, { heroSlides: currentSlides }, { merge: true });
    setAssets((prev) => ({ ...prev, heroSlides: currentSlides }));
  }, [assets.heroSlides]);

  const updateShootBackground = useCallback(async (url: string) => {
    await setDoc(ASSETS_DOC_REF, { shootBackground: url }, { merge: true });
    setAssets((prev) => ({ ...prev, shootBackground: url }));
  }, []);

  const updateContactBackground = useCallback(async (url: string) => {
    await setDoc(ASSETS_DOC_REF, { contactBackground: url }, { merge: true });
    setAssets((prev) => ({ ...prev, contactBackground: url }));
  }, []);

  const updateServiceCover = useCallback(async (slug: string, url: string) => {
    const updated = { ...(assets.serviceCovers || {}), [slug]: url };
    await setDoc(ASSETS_DOC_REF, { serviceCovers: updated }, { merge: true });
    setAssets((prev) => ({ ...prev, serviceCovers: updated }));
  }, [assets.serviceCovers]);

  const updateGalleryCover = useCallback(async (key: string, url: string) => {
    const updated = { ...(assets.galleryCovers || {}), [key]: url };
    await setDoc(ASSETS_DOC_REF, { galleryCovers: updated }, { merge: true });
    setAssets((prev) => ({ ...prev, galleryCovers: updated }));
  }, [assets.galleryCovers]);

  const updateAboutPhoto = useCallback(async (key: string, url: string) => {
    const updated = { ...(assets.aboutPhotos || {}), [key]: url };
    await setDoc(ASSETS_DOC_REF, { aboutPhotos: updated }, { merge: true });
    setAssets((prev) => ({ ...prev, aboutPhotos: updated }));
  }, [assets.aboutPhotos]);

  const resetAsset = useCallback(async (field: keyof SiteAssets, key?: string | number) => {
    if (field === 'heroSlides' && typeof key === 'number') {
      const currentSlides = [...(assets.heroSlides || [])];
      delete currentSlides[key];
      await setDoc(ASSETS_DOC_REF, { heroSlides: currentSlides }, { merge: true });
      setAssets((prev) => ({ ...prev, heroSlides: currentSlides }));
    } else if (field === 'serviceCovers' && typeof key === 'string') {
      const updated = { ...(assets.serviceCovers || {}) };
      delete updated[key];
      await setDoc(ASSETS_DOC_REF, { serviceCovers: updated }, { merge: true });
      setAssets((prev) => ({ ...prev, serviceCovers: updated }));
    } else if (field === 'galleryCovers' && typeof key === 'string') {
      const updated = { ...(assets.galleryCovers || {}) };
      delete updated[key];
      await setDoc(ASSETS_DOC_REF, { galleryCovers: updated }, { merge: true });
      setAssets((prev) => ({ ...prev, galleryCovers: updated }));
    } else if (field === 'aboutPhotos' && typeof key === 'string') {
      const updated = { ...(assets.aboutPhotos || {}) };
      delete updated[key];
      await setDoc(ASSETS_DOC_REF, { aboutPhotos: updated }, { merge: true });
      setAssets((prev) => ({ ...prev, aboutPhotos: updated }));
    } else if (field === 'shootBackground') {
      await setDoc(ASSETS_DOC_REF, { shootBackground: '' }, { merge: true });
      setAssets((prev) => ({ ...prev, shootBackground: undefined }));
    } else if (field === 'contactBackground') {
      await setDoc(ASSETS_DOC_REF, { contactBackground: '' }, { merge: true });
      setAssets((prev) => ({ ...prev, contactBackground: undefined }));
    }
  }, [assets]);

  return {
    assets,
    loading,
    updateHeroSlide,
    updateShootBackground,
    updateContactBackground,
    updateServiceCover,
    updateGalleryCover,
    updateAboutPhoto,
    resetAsset,
  };
}
