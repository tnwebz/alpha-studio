import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ImageGallery } from '@/components/ImageGallery';
import { SERVICE_META, type ServiceSlug } from '@/data/gallery';
import { useAdmin } from '@/hooks/useAdmin';
import { useGallery } from '@/hooks/useGallery';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';

const SLUGS: ServiceSlug[] = [
  'birthday', 'hindu_wedding', 'christian_wedding', 'naming_ceremony',
  'engagement', 'housewarming', 'puberty', 'aldhi',
  'reception', 'bangle_ceremony', 'salangai_poojai', 'maternity',
  'model_shoot', 'gift_items', 'outdoor', 'candid', 'events', 'others', 'candid_videos', 'drone_videos'
];

export function CategoryGalleryPage() {
  const { slug } = useParams<{ slug: string }>();
  const validSlug = (slug && SLUGS.includes(slug as ServiceSlug)) ? (slug as ServiceSlug) : 'outdoor';
  const meta = SERVICE_META[validSlug] ?? SERVICE_META['outdoor'];
  
  const { isAdmin } = useAdmin();
  const { images, loading, addImages, removeImage } = useGallery(validSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3E9DC]">
      <header className="sticky top-0 z-40 border-b border-[#681C2B]/30 bg-[#3D111B]/95 text-white px-4 py-3 backdrop-blur sm:px-8 sm:py-4 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link
            to="/"
            className="shrink-0 rounded-full border border-[#DCC9B6]/30 bg-[#681C2B] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#3D111B] sm:text-xs sm:tracking-[0.2em]"
          >
            ← Back to Home
          </Link>
          <h1 className="truncate text-center font-serif text-lg font-bold text-[#FAF6F0] sm:text-2xl">{meta.title}</h1>
          <span className="w-12 shrink-0 sm:w-20" />
        </div>
      </header>

      <div className="px-4 pb-4 pt-8 text-center sm:px-8 sm:pt-10">
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#746A67] sm:text-base">{meta.description}</p>
      </div>

      {isAdmin && (
        <div className="mx-auto mt-4 max-w-lg px-4">
          <CloudinaryUpload onUploadSuccess={addImages} />
        </div>
      )}

      <ImageGallery images={images} loading={loading} isAdmin={isAdmin} onDelete={removeImage} />
    </div>
  );
}
