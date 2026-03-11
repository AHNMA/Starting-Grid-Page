import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Admin from './pages/Admin';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* Global Background Effect */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-f1dark">
          <div className="bg-hero-pattern opacity-80 absolute inset-0"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-f1dark via-f1dark/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-f1dark via-f1dark/50 to-transparent" />
        </div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
