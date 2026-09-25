import { useState, useEffect } from "react";
import { doc, onSnapshot, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type GalleryCategory } from "@/data/gallery";
import { CircularGallery, type GalleryItem } from "./CircularGallery";
import { useAdmin } from "@/hooks/useAdmin";
import { useSiteAssets } from "@/hooks/useSiteAssets";
import { AdminUploadModal } from "./AdminUploadModal";
import { CloudinaryUpload } from "./CloudinaryUpload";
import {
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Camera,
} from "lucide-react";

interface CategoryConfig {
  key: GalleryCategory;
  label: string;
  defaultImage: string;
  subtitle: string;
  isVideo?: boolean;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "outdoor",
    label: "Outdoor",
    defaultImage: "/SAMPLE PICS/SAMPLE PICS/009 OUTDOOR/0 (10) (website).jpg",
    subtitle: "Captivating outdoor portraits & scenic pre-wedding shoots",
  },
  {
    key: "candid",
    label: "Candid",
    defaultImage: "/SAMPLE PICS/SAMPLE PICS/003 ENGAGEMENT/0 (2) (website).jpg",
    subtitle: "Unscripted emotions, genuine smiles & precious moments",
  },
  {
    key: "events",
    label: "Events",
    defaultImage: "/SAMPLE PICS/SAMPLE PICS/001 RECEPTION/0 (6).jpg",
    subtitle: "Cultural milestones, grand celebrations & receptions",
  },
  {
    key: "others",
    label: "Others",
    defaultImage:
      "/SAMPLE PICS/SAMPLE PICS/015 MODEL SHOOT/DSC05120 (website).JPG",
    subtitle: "High-fashion modeling shoots & customized gift merchandise",
  },
  {
    key: "model_shoot",
    label: "Model Shoot",
    defaultImage: "/mod.JPG",
    subtitle: "High-fashion, portfolio & commercial modeling shoots",
  },
  {
    key: "drone_videos",
    label: "Drone Shorts",
    defaultImage: "/dr.png",
    subtitle: "Breathtaking 4K aerial videography & landscape perspectives",
    isVideo: true,
  },
];

export function GallerySection() {
  const { isAdmin } = useAdmin();
  const { assets, updateGalleryCover, resetAsset } = useSiteAssets();
  const [cloudinaryThumbs, setCloudinaryThumbs] = useState<
    Record<string, string>
  >({});
  const [adminUploadCategory, setAdminUploadCategory] =
    useState<GalleryCategory>("outdoor");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<
    string | null
  >(null);
  const [editingGalleryCover, setEditingGalleryCover] = useState<{
    key: GalleryCategory;
    label: string;
    currentImage: string;
  } | null>(null);

  // Subscribe to Firestore for real-time Cloudinary-uploaded photo updates
  useEffect(() => {
    const unsubscribes = CATEGORIES.map((cat) => {
      const docRef = doc(db, "galleries", cat.key);
      return onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.urls) && data.urls.length > 0) {
              setCloudinaryThumbs((prev) => ({
                ...prev,
                [cat.key]: data.urls[0],
              }));
            }
          }
        },
        (error) => {
          console.warn(`Firestore subscription notice for ${cat.key}:`, error);
        },
      );
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Admin upload handler to persist new Cloudinary URLs to Firestore
  const handleAdminUploadSuccess = async (urls: string[]) => {
    if (!adminUploadCategory || urls.length === 0) return;
    try {
      const docRef = doc(db, "galleries", adminUploadCategory);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const existingUrls = docSnap.data().urls || [];
        const updatedUrls = [...urls, ...existingUrls];
        await updateDoc(docRef, { urls: updatedUrls });
      } else {
        await setDoc(docRef, { urls: urls });
      }

      setUploadSuccessMessage(
        `Successfully uploaded ${urls.length} media item(s) to ${CATEGORIES.find((c) => c.key === adminUploadCategory)?.label || adminUploadCategory}!`,
      );
      setTimeout(() => setUploadSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error("Error saving to Firestore:", err);
      alert("Failed to save to gallery: " + err.message);
    }
  };

  // Build the 3D gallery items using custom box covers, live Cloudinary sync, or default images
  const galleryItems: GalleryItem[] = CATEGORIES.map((cat) => {
    const customCover = assets.galleryCovers?.[cat.key];
    const liveThumb = cloudinaryThumbs[cat.key];
    const displayImage = customCover || liveThumb || cat.defaultImage;

    return {
      key: cat.key,
      common: cat.label,
      binomial: cat.subtitle,
      link: `/collections/${cat.key}`,
      photo: {
        url: displayImage,
        text: `${cat.label} Photography`,
        pos: "center",
        by: "Alpha Studio",
      },
      isVideo: cat.isVideo,
      isCloudinary: Boolean(customCover || liveThumb),
    };
  });

  return (
    <section
      id="gallery"
      className="relative z-20 rounded-t-2xl bg-[#FAF6F0] px-4 pb-16 pt-12 shadow-[0_-16px_40px_rgba(0,0,0,0.04)] border-t border-[#DCC9B6]/40 sm:rounded-t-[2.5rem] sm:px-8 sm:pb-24 sm:pt-16 sm:shadow-[0_-24px_48px_rgba(0,0,0,0.06)] lg:px-12 lg:pt-20 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#681C2B]">
              Portfolio
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#241F20] sm:text-4xl lg:text-5xl">
              Our Gallery
            </h2>
            <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-[#746A67]">
              Explore our interactive 3D portfolio showcase. Rotate to discover
              curated categories, and click any card to view the complete
              collection.
            </p>
          </div>

          {/* Admin Cloudinary Quick Upload Trigger */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowAdminPanel((prev) => !prev)}
              className="flex items-center gap-2 self-start sm:self-auto rounded-full border border-[#DCC9B6] bg-white px-4 py-2 text-xs font-semibold text-[#681C2B] shadow-sm transition-all hover:bg-[#FAF6F0] hover:border-[#681C2B]/50"
            >
              <UploadCloud className="h-4 w-4 text-[#681C2B]" />
              <span>Admin: Cloudinary Upload</span>
              {showAdminPanel ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Collapsible Admin Cloudinary Upload Panel */}
        {isAdmin && showAdminPanel && (
          <div className="mt-8 mx-auto max-w-xl rounded-2xl border border-[#DCC9B6] bg-white p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCC9B6]/40 mb-5">
              <div>
                <h3 className="font-serif text-base font-bold text-[#241F20]">
                  Cloudinary Upload Studio
                </h3>
                <p className="text-xs text-[#746A67]">
                  Upload new photos or video directly into any collection
                </p>
              </div>
              <span className="rounded-full bg-[#681C2B]/10 px-2.5 py-1 text-[11px] font-semibold text-[#681C2B]">
                Admin Mode
              </span>
            </div>

            {uploadSuccessMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{uploadSuccessMessage}</span>
              </div>
            )}

            <div className="mb-5">
              <label
                htmlFor="gallery-category-select"
                className="block text-xs font-semibold text-[#241F20] mb-2"
              >
                Select Target Collection
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setAdminUploadCategory(cat.key)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      adminUploadCategory === cat.key
                        ? "bg-[#681C2B] text-white shadow-sm"
                        : "bg-[#FAF6F0] text-[#241F20] border border-[#DCC9B6]/60 hover:bg-[#DCC9B6]/30"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Change Box Cover for selected category */}
            <div className="mb-4 pt-2 border-t border-[#DCC9B6]/40 flex items-center justify-between">
              <span className="text-xs text-[#746A67]">
                Want to change just the 3D card cover image?
              </span>
              <button
                type="button"
                onClick={() => {
                  const cat = CATEGORIES.find(
                    (c) => c.key === adminUploadCategory,
                  );
                  if (cat) {
                    setEditingGalleryCover({
                      key: cat.key,
                      label: cat.label,
                      currentImage:
                        assets.galleryCovers?.[cat.key] ||
                        cloudinaryThumbs[cat.key] ||
                        cat.defaultImage,
                    });
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-[#681C2B]/40 bg-[#FAF6F0] px-3 py-1.5 text-xs font-semibold text-[#681C2B] hover:bg-[#681C2B]/10 transition-colors"
              >
                <Camera className="h-3.5 w-3.5 text-[#681C2B]" />
                <span>
                  Change "
                  {CATEGORIES.find((c) => c.key === adminUploadCategory)?.label}
                  " Cover
                </span>
              </button>
            </div>

            <CloudinaryUpload onUploadSuccess={handleAdminUploadSuccess} />
          </div>
        )}

        {/* Rebuilt 3D Circular Gallery View */}
        <div className="mt-6 sm:mt-10">
          <CircularGallery
            items={galleryItems}
            autoRotateSpeed={0.035}
            isAdmin={isAdmin}
            onEditCover={(key) => {
              const cat = CATEGORIES.find((c) => c.key === key);
              if (cat) {
                setEditingGalleryCover({
                  key: cat.key,
                  label: cat.label,
                  currentImage:
                    assets.galleryCovers?.[cat.key] ||
                    cloudinaryThumbs[cat.key] ||
                    cat.defaultImage,
                });
              }
            }}
          />
        </div>
      </div>

      {/* Admin Upload Modal for 3D Gallery Box Cover */}
      {editingGalleryCover && (
        <AdminUploadModal
          isOpen={Boolean(editingGalleryCover)}
          onClose={() => setEditingGalleryCover(null)}
          title={`Change "${editingGalleryCover.label}" Box Cover`}
          subtitle="Upload a replacement 3D gallery card cover image via Cloudinary"
          currentImageUrl={editingGalleryCover.currentImage}
          onUploadSuccess={(url) =>
            updateGalleryCover(editingGalleryCover.key, url)
          }
          onResetToDefault={() =>
            resetAsset("galleryCovers", editingGalleryCover.key)
          }
        />
      )}
    </section>
  );
}
