import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AboutCardData {
  id: string;
  name: string;
  designation: string;
  quote: string;
  src: string;
}

export const DEFAULT_ABOUT_CARDS: AboutCardData[] = [
  {
    id: 'card_1',
    name: 'Mr. Alwin',
    designation: 'PROPRIETOR & LEAD STORYTELLER',
    quote:
      'With an eye for emotion and a passion for storytelling, I capture authentic moments and transform them into timeless cinematic memories. Every frame is crafted with care, preserving genuine emotions, beautiful details, and fleeting moments so you can relive your most cherished memories for years to come.',
    src: '/photo1.png',
  },
  {
    id: 'card_2',
    name: 'Mr. X',
    designation: 'PROPRIETOR & CREATIVE DIRECTOR',
    quote:
      "Behind every great photograph lies an unspoken narrative. Our dedication is to craft visual legacies that transcend time—blending editorial elegance with heartfelt candid moments to celebrate life's most meaningful chapters.",
    src: '/photo2.png',
  },
  {
    id: 'card_3',
    name: '',
    designation: '',
    quote: '',
    src: '',
  },
  {
    id: 'card_4',
    name: '',
    designation: '',
    quote: '',
    src: '',
  },
  {
    id: 'card_5',
    name: '',
    designation: '',
    quote: '',
    src: '',
  },
];

export interface CustomService {
  slug: string;
  title: string;
  description: string;
  image: string;
}

export interface SiteAssets {
  heroSlides?: string[]; // Array of Cloudinary URLs for the 4 slides
  shootBackground?: string; // Cloudinary URL for ShootSection
  contactBackground?: string; // Cloudinary URL for ContactSection
  serviceCovers?: Record<string, string>; // category slug -> Cloudinary URL
  galleryCovers?: Record<string, string>; // category key -> Cloudinary URL
  aboutPhotos?: Record<string, string>; // 'alwin' | 'x' -> Cloudinary URL
  aboutCards?: AboutCardData[]; // 5 cards for the About Us Section
  serviceOrder?: string[]; // ordered array of service slugs
  customServices?: CustomService[]; // admin-created catalog entries
  serviceDescriptions?: Record<string, { title: string; description: string }>; // overrides for titles/descriptions
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

  const updateAboutCard = useCallback(async (index: number, card: AboutCardData) => {
    const base = assets.aboutCards && assets.aboutCards.length > 0 ? assets.aboutCards : DEFAULT_ABOUT_CARDS;
    const current = [...base];
    current[index] = card;
    await setDoc(ASSETS_DOC_REF, { aboutCards: current }, { merge: true });
    setAssets((prev) => ({ ...prev, aboutCards: current }));
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      const data = cached ? JSON.parse(cached) : {};
      data.aboutCards = current;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage cache error:', e);
    }
  }, [assets.aboutCards]);

  const addAboutCard = useCallback(async (card: AboutCardData) => {
    const base = assets.aboutCards && assets.aboutCards.length > 0 ? assets.aboutCards : DEFAULT_ABOUT_CARDS;
    const current = [...base, card];
    await setDoc(ASSETS_DOC_REF, { aboutCards: current }, { merge: true });
    setAssets((prev) => ({ ...prev, aboutCards: current }));
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      const data = cached ? JSON.parse(cached) : {};
      data.aboutCards = current;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage cache error:', e);
    }
  }, [assets.aboutCards]);

  const deleteAboutCard = useCallback(async (index: number) => {
    const base = assets.aboutCards && assets.aboutCards.length > 0 ? assets.aboutCards : DEFAULT_ABOUT_CARDS;
    if (base.length <= 1) {
      throw new Error('Cannot delete the only profile box.');
    }
    const current = base.filter((_, i) => i !== index);
    await setDoc(ASSETS_DOC_REF, { aboutCards: current }, { merge: true });
    setAssets((prev) => ({ ...prev, aboutCards: current }));
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      const data = cached ? JSON.parse(cached) : {};
      data.aboutCards = current;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage cache error:', e);
    }
  }, [assets.aboutCards]);

  const updateAllAboutCards = useCallback(async (cards: AboutCardData[]) => {
    await setDoc(ASSETS_DOC_REF, { aboutCards: cards }, { merge: true });
    setAssets((prev) => ({ ...prev, aboutCards: cards }));
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      const data = cached ? JSON.parse(cached) : {};
      data.aboutCards = cards;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage cache error:', e);
    }
  }, []);

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
    } else if (field === 'aboutCards' && typeof key === 'number') {
      const base = assets.aboutCards && assets.aboutCards.length > 0 ? assets.aboutCards : DEFAULT_ABOUT_CARDS;
      const current = [...base];
      if (DEFAULT_ABOUT_CARDS[key]) {
        current[key] = { ...DEFAULT_ABOUT_CARDS[key] };
      } else {
        current[key] = { id: `card_${key + 1}`, name: '', designation: '', quote: '', src: '' };
      }
      await setDoc(ASSETS_DOC_REF, { aboutCards: current }, { merge: true });
      setAssets((prev) => ({ ...prev, aboutCards: current }));
    } else if (field === 'shootBackground') {
      await setDoc(ASSETS_DOC_REF, { shootBackground: '' }, { merge: true });
      setAssets((prev) => ({ ...prev, shootBackground: undefined }));
    } else if (field === 'contactBackground') {
      await setDoc(ASSETS_DOC_REF, { contactBackground: '' }, { merge: true });
      setAssets((prev) => ({ ...prev, contactBackground: undefined }));
    }
  }, [assets]);

  const updateServiceDescription = useCallback(async (slug: string, title: string, description: string) => {
    const updated = { ...(assets.serviceDescriptions || {}), [slug]: { title, description } };
    await setDoc(ASSETS_DOC_REF, { serviceDescriptions: updated }, { merge: true });
    setAssets((prev) => ({ ...prev, serviceDescriptions: updated }));
  }, [assets.serviceDescriptions]);

  // Remove a service slug from the active order (effectively hides it without deleting)
  const removeServiceFromOrder = useCallback(async (slug: string) => {
    const allSlugs = [
      'birthday', 'hindu_wedding', 'christian_wedding', 'naming_ceremony',
      'engagement', 'housewarming', 'puberty', 'aldhi', 'reception',
      'bangle_ceremony', 'salangai_poojai', 'maternity', 'model_shoot', 'gift_items',
      ...(assets.customServices || []).map((s) => s.slug),
    ];
    const currentOrder = assets.serviceOrder && assets.serviceOrder.length > 0
      ? assets.serviceOrder
      : allSlugs;
    const newOrder = currentOrder.filter((s) => s !== slug);
    await setDoc(ASSETS_DOC_REF, { serviceOrder: newOrder }, { merge: true });
    setAssets((prev) => ({ ...prev, serviceOrder: newOrder }));
  }, [assets.serviceOrder, assets.customServices]);

  const updateServiceOrder = useCallback(async (order: string[]) => {
    await setDoc(ASSETS_DOC_REF, { serviceOrder: order }, { merge: true });
    setAssets((prev) => ({ ...prev, serviceOrder: order }));
  }, []);

  const addCustomService = useCallback(async (service: CustomService) => {
    const current = [...(assets.customServices || []), service];
    await setDoc(ASSETS_DOC_REF, { customServices: current }, { merge: true });
    setAssets((prev) => ({ ...prev, customServices: current }));
  }, [assets.customServices]);

  const removeCustomService = useCallback(async (slug: string) => {
    const current = (assets.customServices || []).filter((s) => s.slug !== slug);
    await setDoc(ASSETS_DOC_REF, { customServices: current }, { merge: true });
    setAssets((prev) => ({ ...prev, customServices: current }));
    // also remove from serviceOrder if present
    const newOrder = (assets.serviceOrder || []).filter((s) => s !== slug);
    await setDoc(ASSETS_DOC_REF, { serviceOrder: newOrder }, { merge: true });
    setAssets((prev) => ({ ...prev, serviceOrder: newOrder }));
  }, [assets.customServices, assets.serviceOrder]);

  return {
    assets,
    loading,
    updateHeroSlide,
    updateShootBackground,
    updateContactBackground,
    updateServiceCover,
    updateGalleryCover,
    updateAboutPhoto,
    updateAboutCard,
    addAboutCard,
    deleteAboutCard,
    updateAllAboutCards,
    updateServiceOrder,
    addCustomService,
    removeCustomService,
    updateServiceDescription,
    removeServiceFromOrder,
    resetAsset,
  };
}
