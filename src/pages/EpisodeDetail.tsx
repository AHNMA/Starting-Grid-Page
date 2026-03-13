import Footer from '../components/Footer';
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import DynamicEpisodeText from "../components/DynamicEpisodeText";
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, AlertCircle, Calendar, Timer, Headphones, Apple, Youtube, Rss } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/Header';
import CustomPlayer from '../components/CustomPlayer';
import { Episode, PodcastInfo, Platform } from '../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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




const getIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'spotify': return <Headphones className="w-5 h-5" />;
    case 'apple': return <Apple className="w-5 h-5" />;
    case 'youtube': return <Youtube className="w-5 h-5" />;
    case 'rtl': return <Play className="w-5 h-5" />;
    case 'deezer': return <Headphones className="w-5 h-5" />;
    default: return <Rss className="w-5 h-5" />;
  }
};


export default function EpisodeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [info, setInfo] = useState<PodcastInfo | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [epRes, infoRes, platformsRes] = await Promise.all([
          fetch(`/api/episode/${slug}`),
          fetch('/api/podcast'),
          fetch('/api/platforms')
        ]);

        const epData = await epRes.json();
        const infoData = await infoRes.json();
        const platformsData = await platformsRes.json();

        // Check if episode exists (API might return empty object if not found)
        if (!epData || !epData.id) {
            setError("Episode nicht gefunden.");
        } else {
            setEpisode(epData);
        }

        setInfo(infoData);
        setPlatforms(platformsData);
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
    <div className="min-h-screen bg-f1dark text-white font-sans selection:bg-f1red selection:text-white flex flex-col">
      <Helmet>
        <title>{`Starting Grid – Der Formel-1-Podcast - ${episode.title}`}</title>
      </Helmet>
      <AnimatedBackground />
      {/* Header Bar */}
      <Header info={info} />

      {/* Main Content */}
      <main className="pt-32 pb-16 md:pb-32 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 flex-1 w-full">

        <article className="bg-gradient-to-br from-f1gray to-f1dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">



          <div className="p-6 md:p-12 relative z-10">
            <div className="flex flex-col gap-6 md:gap-8 items-start">

              {/* Header Section: Title and Meta */}
              <div className="w-full">
                {/* Breadcrumb / Back Link */}
                <div className="mb-4 md:mb-6">
                  <Link to="/" className="inline-flex items-center gap-2 text-f1red hover:text-white transition-colors font-mono text-sm uppercase tracking-wider">
                    <ArrowLeft className="w-4 h-4" /> Alle Episoden
                  </Link>
                </div>

                {/* Title */}
                <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-lg mb-4 md:mb-6 w-full">
                  {episode.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] md:text-sm font-mono text-f1red font-bold uppercase tracking-widest">
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
              </div>

              {/* Media Section: Image and Player/Platforms */}
              <div className="grid lg:grid-cols-2 gap-8 items-stretch w-full">
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

                {/* Player Section */}
                {episode.audio_url && episode.audio_url !== '#' && (
                  <div className="w-full flex flex-col justify-between overflow-hidden h-full">
                    <div className="w-full min-w-0">
                      <CustomPlayer episode={episode} />
                    </div>

                    {/* Platforms */}
                    {platforms && platforms.length > 0 && (
                      <div className="flex items-end justify-between gap-2 md:gap-4 w-full mt-6">
                        {(Array.isArray(platforms) ? platforms : []).map(p => (
                          <a
                            key={p.id}
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 h-10 md:h-16 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-f1red hover:border-f1red transition-all group shadow-lg overflow-hidden rounded-xl min-w-0"
                            title={p.name}
                          >
                            {p.icon_url ? (
                              <div
                                className="w-5 h-5 md:w-8 md:h-8 bg-gray-400 group-hover:bg-white transition-colors"
                                style={{
                                  WebkitMaskImage: `url(${p.icon_url})`,
                                  WebkitMaskSize: 'contain',
                                  WebkitMaskRepeat: 'no-repeat',
                                  WebkitMaskPosition: 'center',
                                  maskImage: `url(${p.icon_url})`,
                                  maskSize: 'contain',
                                  maskRepeat: 'no-repeat',
                                  maskPosition: 'center',
                                }}
                                title={p.name}
                              />
                            ) : (
                              <span className="text-gray-400 group-hover:text-white transition-colors">
                                {getIcon(p.icon_name)}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description Wrapper */}
              <div className="w-full flex flex-col">

                {/* Description */}
                <div className="mt-4 border-t border-white/10 pt-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Episoden-Notizen</h2>
                    <DynamicEpisodeText description={episode.description} className="text-xs md:text-sm font-mono text-gray-300 leading-relaxed" />
                </div>


              </div>

            </div>
          </div>
        </article>

      </main>

      <Footer />
    </div>
  );
}
