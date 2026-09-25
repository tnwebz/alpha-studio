import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { CategoryGalleryPage } from '@/pages/CategoryGalleryPage';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

function App() {
  return (
    <BrowserRouter>
      <FloatingWhatsApp />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collections/:slug" element={<CategoryGalleryPage />} />
        {/* Catch-all route to redirect any unknown paths to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
