import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Admin from './pages/Admin';
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
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
