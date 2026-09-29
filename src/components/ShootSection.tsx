import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useSiteAssets } from '@/hooks/useSiteAssets';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary';
import { AdminUploadModal } from './AdminUploadModal';

export function ShootSection() {
  const { isAdmin } = useAdmin();
  const { assets, updateShootBackground, resetAsset } = useSiteAssets();
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobileScreen(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const rawDesktopBg = assets.shootBackground || "/n1.jpg";
  const rawMobileBg = assets.shootBackgroundMobile || assets.shootBackground || "/n1.jpg";
  const activeDesktopBg = getOptimizedCloudinaryUrl(rawDesktopBg, 'FULLSCREEN');
  const activeMobileBg = getOptimizedCloudinaryUrl(rawMobileBg, { width: 768 });

  return (
    <section className="relative flex min-h-[85vh] w-full items-center overflow-hidden bg-black py-32 sm:py-44 lg:py-56">
      {/* Background Image: Responsive Desktop (Landscape) & Mobile (Portrait) */}
      <div className="absolute inset-0">
        <picture className="absolute inset-0 block h-full w-full">
          <source media="(max-width: 639px)" srcSet={activeMobileBg} />
          <img
            src={activeDesktopBg}
            alt="Let's shoot your story"
            className="h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </picture>

        {/* Clean Neutral Scrim: Removed heavy color shade so natural photo tones shine through with perfect text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent sm:bg-gradient-to-r sm:from-black/65 sm:via-black/25 sm:to-transparent pointer-events-none" />
      </div>

      {/* Admin Change Background Button */}
      {isAdmin && (
        <div className="absolute top-6 right-6 z-30">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[#770000]/60 bg-[#770000]/90 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-[#770000] hover:scale-105 cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5 text-[#DCC9B6]" />
            <span>Admin: Change Background ({isMobileScreen ? 'Mobile Portrait' : 'Desktop Landscape'})</span>
          </button>
        </div>
      )}

      {/* Admin Upload Modal */}
      <AdminUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Change 'Shoot Your Story' Background (${isMobileScreen ? 'Mobile Portrait' : 'Desktop Landscape'})`}
        subtitle={
          isMobileScreen
            ? "Mobile View: Upload a vertical (portrait: Height > Width) photo for mobile."
            : "Desktop View: Upload a horizontal (landscape: Width > Height) photo for desktop."
        }
        currentImageUrl={isMobileScreen ? activeMobileBg : activeDesktopBg}
        aspectRatioConstraint={isMobileScreen ? 'portrait-only' : 'landscape-only'}
        onUploadSuccess={(url) => updateShootBackground(url, isMobileScreen)}
        onResetToDefault={() => resetAsset('shootBackground')}
      />

      {/* Content Container - Far Left Aligned */}
      <div className="relative z-10 w-full px-6 sm:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-sm sm:max-w-md lg:max-w-lg"
        >
          <h2 className="font-serif text-4xl font-normal leading-[1.15] text-[#FAF6F0] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-5xl lg:text-6xl">
            Let's shoot
            <br />
            your story.
          </h2>

          <p className="mt-4 text-base leading-relaxed text-[#FAF6F0]/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)] sm:mt-6 sm:text-lg">
            Where wedding photography meets chaos, charm, and chemistry.
          </p>

          <div className="mt-8 sm:mt-10">
            <a
              href="#contact"
              className="inline-block border border-[#DCC9B6]/40 bg-[#770000] px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition-all duration-300 hover:bg-[#880000] hover:border-white hover:scale-105 sm:text-sm"
            >
              CONTACT US
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
