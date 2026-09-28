import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { IntroLoader } from '@/components/IntroLoader';

// Route-level code splitting: Gallery page assets are only loaded when visiting /collections/:slug
const CategoryGalleryPage = lazy(() =>
  import('@/pages/CategoryGalleryPage').then((m) => ({ default: m.CategoryGalleryPage }))
);

function App() {
  return (
    <BrowserRouter>
      <IntroLoader />
      <FloatingWhatsApp />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#770000] border-t-transparent" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections/:slug" element={<CategoryGalleryPage />} />
          {/* Catch-all route to redirect any unknown paths to the home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
