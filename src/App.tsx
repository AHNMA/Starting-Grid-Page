import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Admin from './pages/Admin';
import EpisodeDetail from './pages/EpisodeDetail';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import Shop from './pages/Shop';
import GlobalBackground from './components/GlobalBackground';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* Global Background Effect */}
        <GlobalBackground />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/episode/:slug" element={<EpisodeDetail />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
