import { useLocation } from 'react-router-dom';

export default function GlobalBackground() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-f1dark"></div>
    );
  }

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-f1dark">
      <div className="bg-hero-pattern opacity-80 absolute inset-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-f1dark via-f1dark/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-f1dark via-f1dark/50 to-transparent" />
    </div>
  );
}
