import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, AlertCircle } from 'lucide-react';
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

// Custom Player Component
function CustomPlayer({ episode }: { episode: Episode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = (Number(e.target.value) / 100) * audio.duration;
      audio.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  return (
    <div className="mt-8 bg-[#1a1a1a] rounded-xl p-4 sm:p-6 border border-white/5 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsPlaying(!isPlaying);
          }}
          className="w-16 h-16 shrink-0 flex items-center justify-center bg-f1red hover:bg-f1red-dark text-white rounded-full transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(225,6,0,0.4)]"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>

        <div className="flex-1 w-full space-y-2">
          <div className="flex justify-between text-xs font-mono text-gray-400 mb-2">
            <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
            <span>{episode.duration ? formatDuration(episode.duration) : (audioRef.current?.duration ? formatTime(audioRef.current.duration) : '0:00')}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-f1red [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            style={{
              background: `linear-gradient(to right, #e10600 ${progress}%, #374151 ${progress}%)`
            }}
          />
        </div>
      </div>
      <audio ref={audioRef} src={episode.audio_url} preload="metadata" />
    </div>
  );
}

// Helper functions
function formatDuration(durationStr: string | undefined): string {
  if (!durationStr) return '';
  const parts = durationStr.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    if (hours > 0) return `${hours} Std ${mins} Min`;
    return `${mins} Min`;
  } else if (parts.length === 2) {
    return `${parseInt(parts[0], 10)} Min`;
  }
  return durationStr;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
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
      {/* Header Bar */}
      <header className="fixed top-0 w-full z-50 bg-f1dark/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
             {info?.logo_image ? (
                <img src={info.logo_image} alt="Logo" className="h-8 object-contain" />
              ) : (
                <div className="text-2xl font-black italic tracking-tighter">
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
      <main className="pt-32 px-4 sm:px-6 max-w-5xl mx-auto">

        {/* Breadcrumb / Back Link (for mobile mostly) */}
        <div className="mb-8 hidden sm:block">
            <Link to="/" className="inline-flex items-center gap-2 text-f1red hover:text-white transition-colors font-mono text-sm uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4" /> Alle Episoden
            </Link>
        </div>

        <article className="bg-[#141414] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">

          {/* Subtle Background Glow based on F1 Red */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-f1red/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="p-6 md:p-12 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

              {/* Image Section */}
              <div className="w-full md:w-1/3 shrink-0">
                <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl group relative">
                    {imageUrl ? (
                         <img
                         src={imageUrl}
                         alt={episode.title}
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                       />
                    ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-500 font-bold">Kein Bild</span>
                        </div>
                    )}

                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-full inset-ring border border-white/20 rounded-2xl pointer-events-none"></div>
                </div>
              </div>

              {/* Content Section */}
              <div className="w-full md:w-2/3 flex flex-col pt-2 md:pt-4">

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono tracking-widest text-f1red mb-4 uppercase">
                  {episode.published_at && (
                    <span className="bg-f1red/10 px-3 py-1.5 rounded-full border border-f1red/20">
                      {format(new Date(episode.published_at), 'dd. MMMM yyyy', { locale: de })}
                    </span>
                  )}
                  {episode.duration && (
                    <span className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-gray-400">
                      {formatDuration(episode.duration)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
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
                    <DynamicEpisodeText description={episode.description} className="text-lg md:text-xl font-light text-gray-300 leading-relaxed" />
                </div>
              </div>

            </div>
          </div>
        </article>

      </main>
    </div>
  );
}
