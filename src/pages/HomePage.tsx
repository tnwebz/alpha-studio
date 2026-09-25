import { ContactSection } from '@/components/ContactSection';
import { EditorialHero } from '@/components/EditorialHero';
import { GallerySection } from '@/components/GallerySection';
import { ServicesSection } from '@/components/ServicesSection';
import { ShootSection } from '@/components/ShootSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { Footer } from '@/components/Footer';

export function HomePage() {
  return (
    <>
      <EditorialHero />
      <ServicesSection />
      <ShootSection />
      <GallerySection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </>
  );
}
