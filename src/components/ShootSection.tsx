import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useSiteAssets } from '@/hooks/useSiteAssets';
import { AdminUploadModal } from './AdminUploadModal';

export function ShootSection() {
  const { isAdmin } = useAdmin();
  const { assets, updateShootBackground, resetAsset } = useSiteAssets();
  const [modalOpen, setModalOpen] = useState(false);

  const bgImage = assets.shootBackground || "/n1.jpg";

  return (
    <section className="relative flex min-h-[85vh] w-full items-center overflow-hidden bg-black py-32 sm:py-44 lg:py-56">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="Let's shoot your story"
          className="h-full w-full object-cover object-center"
        />
        {/* Subtle Dark Maroon Gradient & Contrast Mask focused on left side */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#3D111B]/90 via-black/70 to-transparent" />
      </div>

      {/* Admin Change Background Button */}
      {isAdmin && (
        <div className="absolute top-6 right-6 z-30">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[#681C2B]/60 bg-[#3D111B]/90 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-[#681C2B] hover:scale-105"
          >
            <Camera className="h-3.5 w-3.5 text-[#DCC9B6]" />
            <span>Admin: Change Background (Cloudinary)</span>
          </button>
        </div>
      )}

      {/* Admin Upload Modal */}
      <AdminUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Change 'Shoot Your Story' Background"
        subtitle="Upload a replacement full-width background photo via Cloudinary"
        currentImageUrl={bgImage}
        onUploadSuccess={(url) => updateShootBackground(url)}
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
          <h2 className="font-serif text-4xl font-normal leading-[1.15] text-[#FAF6F0] sm:text-5xl lg:text-6xl">
            Let's shoot
            <br />
            your story.
          </h2>

          <p className="mt-4 text-base leading-relaxed text-[#DCC9B6] sm:mt-6 sm:text-lg">
            Where wedding photography meets chaos, charm, and chemistry.
          </p>

          <div className="mt-8 sm:mt-10">
            <a
              href="#contact"
              className="inline-block border border-[#DCC9B6] bg-[#681C2B]/90 px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition-all duration-300 hover:bg-[#681C2B] hover:border-white hover:scale-105 sm:text-sm"
            >
              CONTACT US
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
