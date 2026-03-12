import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Play, Clock, ArrowLeft } from 'lucide-react';
import { Episode, PodcastInfo } from '../types';

export default function EpisodeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [info, setInfo] = useState<PodcastInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch podcast info for general branding if needed
    fetch('/api/podcast')
      .then(res => res.json())
      .then(setInfo)
      .catch(console.error);

    // Fetch the specific episode
    fetch(`/api/episodes/slug/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setEpisode(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-f1dark text-white flex items-center justify-center font-display">
        <p className="text-2xl animate-pulse">Lade Episode...</p>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-f1dark text-white flex flex-col items-center justify-center font-display text-center px-4">
        <h1 className="text-4xl md:text-6xl font-black mb-6 text-f1red">Fehler 404</h1>
        <p className="text-xl mb-8">Diese Episode konnte nicht gefunden werden.</p>
        <Link to="/" className="bg-f1red text-white px-8 py-4 font-bold uppercase tracking-widest text-lg transition-colors border-2 border-f1red hover:bg-transparent hover:text-f1red">
          Zurück zur Startseite
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(episode.published_at).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const pageTitle = `${episode.title} | ${info?.title || 'Starting Grid'}`;
  const pageImage = episode.image_url || info?.cover_image;

  return (
    <div className="min-h-screen bg-f1dark text-white flex flex-col font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={episode.description.substring(0, 160)} />

        {/* Open Graph / Social Media */}
        <meta property="og:type" content="music.song" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={episode.description.substring(0, 160)} />
        {pageImage && <meta property="og:image" content={pageImage} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={episode.description.substring(0, 160)} />
        {pageImage && <meta name="twitter:image" content={pageImage} />}
      </Helmet>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-f1dark/90 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-f1red transition-colors font-mono uppercase tracking-widest text-sm font-bold">
            <ArrowLeft className="w-5 h-5" />
            Home
          </Link>
          <div className="font-display font-black text-xl uppercase tracking-widest">
            Starting Grid
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </nav>

      <main className="flex-1 pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto w-full">
        {/* Episode Header */}
        <header className="mb-12">
          {episode.image_url && (
            <div className="w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden mb-8 border border-white/10 shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-f1dark via-f1dark/20 to-transparent z-10" />
              <img
                src={episode.image_url}
                alt={episode.title}
                className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-f1red font-mono font-bold uppercase tracking-widest text-sm mb-6">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            {episode.duration && (
              <>
                <span className="text-white/20">|</span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {episode.duration}
                </span>
              </>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 mb-8 leading-tight">
            {episode.title}
          </h1>

          {/* Audio Player */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 mb-12 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-f1red rounded-full flex items-center justify-center shadow-lg shadow-f1red/20 shrink-0">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
              <div>
                <h3 className="font-display font-bold uppercase text-lg tracking-wider">Jetzt hören</h3>
                <p className="font-mono text-white/50 text-xs uppercase tracking-widest">
                  {episode.audio_url.split('.').pop()?.toUpperCase() || 'AUDIO'} FILE
                </p>
              </div>
            </div>
            <audio
              controls
              className="w-full"
              src={episode.audio_url}
              preload="metadata"
            >
              Ihr Browser unterstützt das Audio-Element nicht.
            </audio>
          </div>

          {/* Fully expanded description */}
          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wider prose-a:text-f1red hover:prose-a:text-white prose-a:transition-colors">
            {/* Split description by newlines and render paragraphs to preserve formatting */}
            {episode.description.split('\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index} className="mb-4 text-gray-300 leading-relaxed font-sans text-lg">
                  {/* Handle basic link parsing if necessary, or just render text */}
                  {paragraph}
                </p>
              ) : <br key={index} />
            ))}
          </div>
        </header>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t-4 border-f1red bg-f1gray text-center text-gray-500 text-sm font-mono flex flex-col items-center gap-6 mt-auto">
        <div className="flex items-center gap-3 opacity-50">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-full" />
          </div>
          <span className="font-display font-bold text-xl uppercase tracking-widest">Starting Grid</span>
        </div>
        <p>© {new Date().getFullYear()} Starting Grid - Der Formel-1-Podcast. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}
