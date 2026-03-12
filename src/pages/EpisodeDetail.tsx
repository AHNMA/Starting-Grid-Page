import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, AlertCircle, Calendar, Timer } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import CustomPlayer from '../components/CustomPlayer';
import { Episode, PodcastInfo } from '../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Dynamic text rendering for description (reused from Home.tsx logic)
function DynamicEpisodeText({ description, className = "" }: { description: string, className?: string }) {
  // If description contains HTML tags
  if (/<[a-z][\s\S]*>/i.test(description)) {
    return (
      <div
        className={`prose prose-invert prose-p:text-gray-400 prose-a:text-f1red hover:prose-a:text-white transition-colors max-w-none [&>p]:mb-4 last:[&>p]:mb-0 ${className}`}
        dangerouslySetInnerHTML={{ __html: description }}
      />
    );
  }

  // If plain text
  return (
    <div className={`space-y-4 text-gray-400 leading-relaxed ${className}`}>
      {description.split('\n\n').map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}

// Helper functions
function formatDuration(duration: string | undefined): string {
  if (!duration) return "";

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (duration.includes(':')) {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
      [hours, minutes, seconds] = parts;
    } else if (parts.length === 2) {
      [minutes, seconds] = parts;
    }
  } else {
    const totalSeconds = parseInt(duration, 10);
    if (!isNaN(totalSeconds)) {
      hours = Math.floor(totalSeconds / 3600);
      minutes = Math.floor((totalSeconds % 3600) / 60);
      seconds = totalSeconds % 60;
    }
  }

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} Std.`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} Min.`);
  }
  if (hours === 0 && minutes === 0 && seconds > 0) {
      parts.push(`${seconds} Sek.`);
  }

  return parts.join(' ') || duration;
}




export default function EpisodeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [info, setInfo] = useState<PodcastInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [epRes, infoRes] = await Promise.all([
          fetch(`/api/episode/${slug}`),
          fetch('/api/podcast')
        ]);

        const epData = await epRes.json();
        const infoData = await infoRes.json();

        // Check if episode exists (API might return empty object if not found)
        if (!epData || !epData.id) {
            setError("Episode nicht gefunden.");
        } else {
            setEpisode(epData);
        }

        setInfo(infoData);
      } catch (err) {
        console.error("Error fetching episode data:", err);
        setError("Fehler beim Laden der Episode.");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
        fetchData();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-f1dark flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-f1red border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-gray-400">Lade Episode...</p>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-f1dark flex flex-col items-center justify-center text-white p-4">
        <AlertCircle className="w-16 h-16 text-f1red mb-4" />
        <h1 className="text-2xl font-bold mb-2 uppercase tracking-wider">{error || "Episode nicht gefunden"}</h1>
        <p className="text-gray-400 mb-8">Die angeforderte Episode konnte nicht geladen werden oder existiert nicht.</p>
        <Link to="/" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition-colors font-bold uppercase text-sm tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Zurück zur Startseite
        </Link>
      </div>
    );
  }

  const imageUrl = episode.image_url || info?.cover_image;

  return (
    <div className="min-h-screen bg-f1dark text-white font-sans selection:bg-f1red selection:text-white pb-24">
      <AnimatedBackground />
      {/* Header Bar */}
      <header className="fixed top-0 w-full z-50 bg-f1dark/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
             {info?.logo_image ? (
                <img src={info.logo_image} alt="Logo" className="h-8 object-contain" />
              ) : (
                <div className="text-2xl font-display font-black tracking-tighter">
                  STARTING<span className="text-f1red">GRID</span>
                </div>
              )}
          </Link>
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 px-4 sm:px-6 max-w-5xl mx-auto relative z-10">

        {/* Breadcrumb / Back Link (for mobile mostly) */}
        <div className="mb-8 hidden sm:block">
            <Link to="/" className="inline-flex items-center gap-2 text-f1red hover:text-white transition-colors font-mono text-sm uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4" /> Alle Episoden
            </Link>
        </div>

        <article className="bg-gradient-to-br from-f1gray to-f1dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">



          <div className="p-6 md:p-12 relative z-10">
            <div className="flex flex-col gap-8 md:gap-12 items-start">

              {/* Image Section */}
              <div className="w-full relative aspect-[16/9]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={episode.title}
                    className="relative z-10 w-full h-full object-cover rounded-xl border border-white/10 shadow-lg pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 rounded-xl pointer-events-none flex items-center justify-center border border-white/5 shadow-lg">
                    <span className="text-gray-500 font-bold">Kein Bild</span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="w-full flex flex-col pt-2 md:pt-4">

                {/* Meta Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] md:text-sm font-mono text-f1red font-bold uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 md:w-4 h-4" />
                    <span className="sm:hidden">
                      {episode.published_at && format(new Date(episode.published_at), 'dd.MM.yyyy')}
                    </span>
                    <span className="hidden sm:inline">
                      {episode.published_at && format(new Date(episode.published_at), 'dd. MMMM yyyy', { locale: de })}
                    </span>
                  </span>
                  {episode.duration && (
                    <>
                      <span className="hidden sm:inline text-gray-600">|</span>
                      <span className="flex items-center gap-2">
                        <Timer className="w-3 h-3 md:w-4 h-4" />
                        {formatDuration(episode.duration)}
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-lg mb-6">
                  {episode.title}
                </h1>

                {/* Audio Player */}
                {episode.audio_url && episode.audio_url !== '#' && (
                  <div className="mb-8">
                     <CustomPlayer episode={episode} />
                  </div>
                )}

                {/* Description */}
                <div className="mt-4 border-t border-white/10 pt-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Episoden-Notizen</h2>
                    <DynamicEpisodeText description={episode.description} className="text-lg md:text-xl font-mono text-gray-300 leading-relaxed" />
                </div>
              </div>

            </div>
          </div>
        </article>

      </main>
    </div>
  );
}
