import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-16 px-6 border-t-4 border-f1red bg-f1gray text-center text-gray-500 text-sm font-mono flex flex-col items-center gap-6 mt-auto">
      <div className="flex items-center gap-3 opacity-50">
        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-full" />
        </div>
        <span className="font-display font-bold text-xl uppercase tracking-widest">Starting Grid</span>
      </div>
      <p>© {new Date().getFullYear()} Starting Grid - Der Formel-1-Podcast. Alle Rechte vorbehalten.</p>
      <Link to="/admin" className="text-f1red/50 hover:text-f1red transition-colors uppercase tracking-widest text-xs border border-f1red/20 px-4 py-2 rounded hover:bg-f1red/10">
        Telemetrie Zugang (Admin)
      </Link>
    </footer>
  );
}
