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
      <p>
        Dieser Podcast wird vermarktet von der{' '}
        <a
          href="https://www.podcastbu.de/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-f1red transition-colors hover:text-white"
        >
          Podcastbude
        </a>
        . Starting Grid ist ein Produkt von{' '}
        <a
          href="https://meinsportpodcast.de/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-f1red transition-colors hover:text-white"
        >
          meinsportpodcast.de
        </a>{' '}
        © {new Date().getFullYear()}
      </p>

      <div className="flex gap-4 font-mono text-xs opacity-70">
        <Link to="/impressum" className="hover:text-f1red transition-colors">
          Impressum
        </Link>
      </div>
    </footer>
  );
}
