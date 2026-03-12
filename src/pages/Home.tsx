import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { PodcastInfo, Host, Episode, Platform } from '../types';
import { FaXTwitter } from 'react-icons/fa6';
import { Play, Calendar, Instagram, Headphones, Youtube, Apple, Rss, ChevronRight, Timer, Menu, X, ChevronDown, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import CustomPlayer from '../components/CustomPlayer';
import AnimatedBackground from '../components/AnimatedBackground';

function formatDuration(duration: string): string {
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
  if (seconds > 0 || (hours === 0 && minutes === 0)) {
    parts.push(`${seconds} Sek.`);
  }

  return parts.join(' ');
}

function HeroImage({ info, episode }: { info: PodcastInfo | null, episode?: Episode | null }) {
  const imageUrl = episode?.image_url || info?.cover_image;

  const content = (
    <div className="relative w-full aspect-[16/9] group cursor-pointer overflow-hidden rounded-xl">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="Podcast Cover"
            className="relative z-10 w-full h-full object-cover border border-white/10 shadow-lg transform transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-f1red text-white font-display font-bold uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <Play className="w-4 h-4 fill-current" />
              Zur Episode
            </span>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-white/5 pointer-events-none flex items-center justify-center border border-white/5 shadow-lg transition-transform duration-700 group-hover:scale-105">
          <Headphones className="w-24 h-24 text-white/20" />
        </div>
      )}
    </div>
  );

  if (episode) {
    return <Link to={`/episode/${episode.slug || episode.id}`}>{content}</Link>;
  }
  return content;
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

function DynamicEpisodeText({ 
  description, 
  className,
  expandable = false
}: { 
  description: string, 
  className?: string,
  expandable?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanDescription = useMemo(() => {
    if (!description) return '';
    if (typeof window === 'undefined') return description;
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(description, 'text/html');
      const feedbackText = "Euer Feedback ist uns wichtig!";
      
      let found = false;
      function findAndStrip(node: Node) {
        if (found) return;
        
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          const index = text.indexOf(feedbackText);
          if (index !== -1) {
            node.textContent = text.substring(0, index).trim();
            found = true;
            
            // Remove following siblings
            let sibling = node.nextSibling;
            while (sibling) {
              const next = sibling.nextSibling;
              node.parentElement?.removeChild(sibling);
              sibling = next;
            }
            
            // Move up and remove following siblings of ancestors
            let parent = node.parentElement;
            while (parent && parent !== doc.body) {
              let pSibling = parent.nextSibling;
              while (pSibling) {
                const next = pSibling.nextSibling;
                parent.parentElement?.removeChild(pSibling);
                pSibling = next;
              }
              parent = parent.parentElement;
            }
          }
        } else {
          const children = Array.from(node.childNodes);
          for (const child of children) {
            findAndStrip(child);
          }
        }
      }
      
      findAndStrip(doc.body);
      return doc.body.innerHTML.trim();
    } catch (e) {
      return description;
    }
  }, [description]);

  const { excerptHtml, isTruncatable } = useMemo(() => {
    if (!cleanDescription || typeof window === 'undefined') return { excerptHtml: cleanDescription, isTruncatable: false };
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanDescription, 'text/html');
      let totalSentencesFound = 0;
      let truncationPointReached = false;

      function processNode(node: Node) {
        if (truncationPointReached) return;

        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          // Split by sentence endings (. ! ?) followed by space or end of string, keeping the delimiter
          const parts = text.split(/([.!?](?:\s|$))/);
          let newText = "";
          
          for (let i = 0; i < parts.length; i++) {
            newText += parts[i];
            // Delimiters are at odd indices because of the capturing group in split()
            if (i % 2 === 1) {
              totalSentencesFound++;
              if (totalSentencesFound === 4) {
                node.textContent = newText.trim();
                truncationPointReached = true;
                break;
              }
            }
          }
          
          // If we finished the text node and didn't reach 4 sentences, 
          // node.textContent remains the full original text of this node.
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const children = Array.from(node.childNodes);
          for (const child of children) {
            if (truncationPointReached) {
              node.removeChild(child);
            } else {
              processNode(child);
            }
          }
        }
      }

      processNode(doc.body);
      
      return { 
        excerptHtml: doc.body.innerHTML, 
        isTruncatable: truncationPointReached 
      };
    } catch (e) {
      console.error("Error truncating description:", e);
      return { excerptHtml: cleanDescription, isTruncatable: false };
    }
  }, [cleanDescription]);

  if (!cleanDescription) return null;

  const showExcerpt = expandable && !isExpanded && isTruncatable;

  return (
    <div className="relative">
      <div className={`prose-custom ${className || ''}`}>
        <div 
          className="transition-all duration-500 ease-in-out"
          dangerouslySetInnerHTML={{ __html: showExcerpt ? excerptHtml : cleanDescription }} 
        />
      </div>

      {expandable && isTruncatable && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-f1red hover:text-white text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors group"
        >
          {isExpanded ? (
            <>Weniger lesen <ChevronDown className="w-3 h-3 rotate-180 transition-transform" /></>
          ) : (
            <>Mehr lesen <ChevronDown className="w-3 h-3 transition-transform group-hover:translate-y-0.5" /></>
          )}
        </button>
      )}
    </div>
  );
}

function ArchiveEpisodeCard({ episode, info, platforms, index }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="w-full"
    >
      <div className="relative w-full bg-gradient-to-br from-f1gray to-f1dark border border-white/5 rounded-xl overflow-hidden">
        <div className="p-5 md:p-10 flex flex-col gap-4 md:gap-8">
          {/* Header Section: Title and Meta */}
          <div className="w-full">
            {/* Title */}
            <Link to={`/episode/${episode.slug || episode.id}`}>
              <h4 className="font-display font-black text-2xl md:text-3xl lg:text-4xl uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-lg mb-4 md:mb-6 hover:text-white transition-all cursor-pointer hover:underline decoration-f1red decoration-4 underline-offset-8">
                {episode.title}
              </h4>
            </Link>
            
            {/* Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] md:text-sm font-mono text-f1red font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <Calendar className="w-3 h-3 md:w-4 h-4" />
                <span className="sm:hidden">
                  {format(new Date(episode.published_at), 'dd.MM.yyyy')}
                </span>
                <span className="hidden sm:inline">
                  {format(new Date(episode.published_at), 'dd. MMMM yyyy', { locale: de })}
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

          {/* Description Section: Full Width */}
          <div className="w-full">
            <DynamicEpisodeText 
              description={episode.description} 
              className="text-xs md:text-sm text-gray-300 leading-relaxed font-mono"
            />
          </div>

          {/* Media Section: Image and Player/Platforms */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Image Section */}
            <div className="hidden lg:block w-full">
              <HeroImage info={info} episode={episode} />
            </div>
            
            {/* Player & Platforms Section */}
            {episode.audio_url && episode.audio_url !== '#' && (
              <div className="w-full max-w-full flex flex-col justify-between overflow-hidden h-full">
                <div className="w-full min-w-0">
                  <CustomPlayer episode={episode} />
                </div>
                
                {/* Platforms */}
                <div className="flex items-end justify-between gap-2 md:gap-4 w-full mt-6">
                  {platforms.map((p: any) => (
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
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [info, setInfo] = useState<PodcastInfo | null>(null);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [visibleEpisodes, setVisibleEpisodes] = useState(3);

  useEffect(() => {
    fetch('/api/podcast').then(r => r.json()).then(setInfo);
    fetch('/api/hosts').then(r => r.json()).then(setHosts);
    fetch('/api/episodes').then(r => r.json()).then(setEpisodes);
    fetch('/api/platforms').then(r => r.json()).then(setPlatforms);
  }, []);

  if (!info) return <div className="min-h-screen bg-f1dark text-white flex items-center justify-center font-display font-bold text-3xl animate-pulse">Lade Telemetrie...</div>;

  const safeEpisodes = Array.isArray(episodes) ? episodes : [];
  const heroEpisode = safeEpisodes.find(e => e.is_hero) || safeEpisodes[0];
  const otherEpisodes = safeEpisodes.filter(e => e.id !== heroEpisode?.id);
  const displayedEpisodes = otherEpisodes.slice(0, visibleEpisodes);

  return (
    <div className="min-h-screen bg-f1dark text-white font-sans antialiased selection:bg-f1red selection:text-white overflow-x-hidden">
      <Helmet>
        <title>{info?.seo_title || 'Starting Grid - Der Formel-1-Podcast'}</title>
        <meta name="description" content={info?.seo_description || 'Der wöchentliche Formel-1-Podcast.'} />
        {info?.seo_keywords && <meta name="keywords" content={info.seo_keywords} />}
        {info?.favicon_image && <link rel="icon" href={info.favicon_image} />}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={info?.seo_title || 'Starting Grid - Der Formel-1-Podcast'} />
        <meta property="og:description" content={info?.seo_description || 'Der wöchentliche Formel-1-Podcast.'} />
        <meta property="og:image" content={info?.social_image || info?.cover_image} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={info?.seo_title || 'Starting Grid - Der Formel-1-Podcast'} />
        <meta name="twitter:description" content={info?.seo_description || 'Der wöchentliche Formel-1-Podcast.'} />
        <meta name="twitter:image" content={info?.social_image || info?.cover_image} />
      </Helmet>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-f1dark/95 border-b-2 border-f1red shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
            {info.logo_image ? (
              <>
                <img src={info.logo_image} alt="Starting Grid Logo" className="hidden md:block h-8 md:h-10 object-contain group-hover:scale-105 transition-transform duration-300" />
                <h1 className="md:hidden text-2xl font-display font-black tracking-wide uppercase italic mt-1">Starting Grid</h1>
              </>
            ) : (
              <>
                {info.cover_image ? (
                  <img src={info.cover_image} alt="Logo" className="hidden md:block h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-f1red group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className="hidden md:block h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-f1red bg-white/10" />
                )}
                <h1 className="text-2xl md:text-3xl font-display font-black tracking-wide uppercase italic mt-1">Starting Grid</h1>
              </>
            )}
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-display font-bold uppercase tracking-widest text-gray-400">
            <a href="#hero" className="hover:text-white hover:text-shadow-glow transition-all">Aktuelle Ausgabe</a>
            <a href="#about" className="hover:text-white hover:text-shadow-glow transition-all">Der Podcast</a>
            <a href="#hosts" className="hover:text-white hover:text-shadow-glow transition-all">Unsere Hosts</a>
            <a href="#episodes" className="hover:text-white hover:text-shadow-glow transition-all">Archiv</a>
          </nav>
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-f1dark border-b border-white/10 px-4 py-4 flex flex-col gap-4 font-display font-bold uppercase tracking-widest text-lg">
            <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-f1red transition-colors">Aktuelle Ausgabe</a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-f1red transition-colors">Der Podcast</a>
            <a href="#hosts" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-f1red transition-colors">Unsere Hosts</a>
            <a href="#episodes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-f1red transition-colors">Archiv</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-6 md:pt-32 md:pb-10 px-4 sm:px-6 relative overflow-hidden min-h-[85vh] md:min-h-[90vh] flex items-center">
        <AnimatedBackground opacity={0.8} />

        <div className="max-w-7xl mx-auto w-full mt-8 md:mt-0">
          <div className="relative w-full bg-gradient-to-br from-f1gray to-f1dark border border-white/5 p-5 md:p-12 lg:p-16 rounded-xl overflow-hidden">
            
            <div className="flex flex-col gap-6 md:gap-8 relative z-10">
              {/* Header Section: Title and Meta */}
              <motion.div 
                className="w-full"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              >
                <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1 md:py-1.5 bg-f1red text-white font-display font-bold text-lg md:text-xl uppercase tracking-wider transform -skew-x-12 mb-2 md:mb-3 shadow-[0_0_15px_rgba(225,6,0,0.5)]">
                  <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full animate-pulse" />
                  Aktuelle Ausgabe
                </div>
                <Link to={`/episode/${heroEpisode?.slug || heroEpisode?.id}`}>
                  <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase leading-none tracking-tight transform -skew-x-6 mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-2xl py-2 hover:text-white transition-all cursor-pointer hover:underline decoration-f1red decoration-4 underline-offset-8">
                    {heroEpisode?.title || "Keine Episode"}
                  </h2>
                </Link>

            {/* Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] md:text-sm font-mono text-f1red font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <Calendar className="w-3 h-3 md:w-4 h-4" />
                <span className="sm:hidden">
                  {heroEpisode?.published_at && format(new Date(heroEpisode.published_at), 'dd.MM.yyyy')}
                </span>
                <span className="hidden sm:inline">
                  {heroEpisode?.published_at && format(new Date(heroEpisode.published_at), 'dd. MMMM yyyy', { locale: de })}
                </span>
              </span>
              {heroEpisode?.duration && (
                <>
                  <span className="hidden sm:inline text-gray-600">|</span>
                  <span className="flex items-center gap-2">
                    <Timer className="w-3 h-3 md:w-4 h-4" />
                    {formatDuration(heroEpisode.duration)}
                  </span>
                </>
              )}
            </div>
              </motion.div>

              {/* Description Section: Full Width */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="w-full"
              >
                <DynamicEpisodeText 
                  description={heroEpisode?.description || ''} 
                  className="text-xs md:text-sm text-gray-300 leading-relaxed font-mono"
                  expandable={true}
                />
              </motion.div>

              {/* Media Section: Image and Player/Platforms */}
              <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                {/* Image Section */}
                <motion.div 
                  className="hidden lg:block w-full"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <HeroImage info={info} episode={heroEpisode} />
                </motion.div>

                {/* Player & Platforms Section */}
                {heroEpisode?.audio_url && heroEpisode.audio_url !== '#' && (
                  <motion.div 
                    className="w-full max-w-full flex flex-col justify-between overflow-hidden h-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div className="w-full min-w-0">
                      <CustomPlayer episode={heroEpisode} />
                    </div>
                    
                    {/* Platforms */}
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
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker (Track with Curbs) */}
      <div className="relative py-6 md:py-8 bg-kerb overflow-hidden transform -skew-y-1 z-20 shadow-2xl mt-5 -mt-2.5 -mb-10 md:-mb-16">
        {/* Asphalt Track with Track Limits (White Outline) */}
        <div className="absolute top-1 bottom-1 md:top-1.5 md:bottom-1.5 left-0 w-full bg-[#151515] border-y-2 border-white flex items-center">
        </div>
        
        <div className="flex w-max animate-ticker relative z-10">
          <div className="flex shrink-0 items-center">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="text-4xl md:text-5xl font-display font-black uppercase italic text-white tracking-widest px-6 whitespace-nowrap drop-shadow-lg">
                Starting Grid <span className="text-f1red mx-4 md:mx-6">///</span> Der Formel-1-Podcast <span className="text-f1red mx-4 md:mx-6">///</span>
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="text-4xl md:text-5xl font-display font-black uppercase italic text-white tracking-widest px-6 whitespace-nowrap drop-shadow-lg">
                Starting Grid <span className="text-f1red mx-4 md:mx-6">///</span> Der Formel-1-Podcast <span className="text-f1red mx-4 md:mx-6">///</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="pt-24 pb-16 md:pt-48 md:pb-32 px-4 sm:px-6 relative bg-f1gray overflow-hidden z-10">
        <AnimatedBackground opacity={0.4} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-end justify-between mb-8 md:mb-16 border-b border-white/10 pb-4 md:pb-6">
            <div>
              <p className="text-f1red font-mono font-bold tracking-widest uppercase mb-1 md:mb-2 text-sm md:text-base">Über Uns</p>
              <h3 className="text-4xl sm:text-5xl md:text-7xl font-display font-black uppercase italic">Der Podcast</h3>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1"
            >
              <div className="prose prose-invert prose-lg font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                {info.about_text || 'Hier gibt es jede Woche die neuesten Infos, Analysen und Meinungen zur Königsklasse des Motorsports.'}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 md:order-2 flex items-center justify-center"
            >
              <div className="relative w-full aspect-[4/3] md:aspect-square flex items-center justify-center">
                {info.about_image ? (
                  <img 
                    src={info.about_image} 
                    alt="Über Uns" 
                    className="max-w-full max-h-full object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/20 font-display font-bold text-2xl uppercase tracking-widest">Starting Grid</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Separator Line */}
      <div className="w-full h-px bg-f1red/30 relative z-20" />

      {/* Hosts Section (Driver Line-Up) */}
      <section id="hosts" className="py-16 md:py-32 px-4 sm:px-6 bg-f1dark relative z-0 overflow-hidden">
        <AnimatedBackground opacity={0.4} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-end justify-between mb-8 md:mb-16 border-b border-white/10 pb-4 md:pb-6">
            <div>
              <p className="text-f1red font-mono font-bold tracking-widest uppercase mb-1 md:mb-2 text-sm md:text-base">Starting Grid</p>
              <h3 className="text-4xl sm:text-5xl md:text-7xl font-display font-black uppercase italic">Unsere Hosts</h3>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {(Array.isArray(hosts) ? hosts : []).map((host, i) => (
              <motion.div 
                key={host.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.2, type: "spring" }}
                className="w-full h-auto md:min-h-[400px]"
              >
                <div className="relative w-full h-full bg-gradient-to-br from-f1gray to-f1dark border border-white/5 rounded-xl p-6 md:p-10 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-4 md:gap-6 mb-4">
                      <div className="w-16 h-16 lg:w-24 lg:h-24 shrink-0 rounded-full overflow-hidden border-2 border-f1red shadow-lg">
                        {host.image_url ? (
                          <img 
                            src={host.image_url} 
                            alt={host.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-black text-xl sm:text-2xl md:text-lg lg:text-2xl xl:text-4xl uppercase italic tracking-wide text-white drop-shadow-md leading-tight whitespace-nowrap truncate">{host.name}</h4>
                      </div>
                    </div>
                    
                    <p className="font-mono text-xs md:text-sm text-gray-300 leading-relaxed line-clamp-4">{host.bio}</p>
                    
                    <div className="mt-auto pt-6 flex items-center justify-between">
                      <div className="flex gap-3">
                        {host.twitter_url && (
                          <a href={host.twitter_url} target="_blank" rel="noreferrer" className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-f1red hover:border-f1red transition-all group shadow-lg overflow-hidden rounded-xl">
                            {/* @ts-expect-error type issue */}
<FaXTwitter className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-white transition-colors" />
                          </a>
                        )}
                        {host.instagram_url && (
                          <a href={host.instagram_url} target="_blank" rel="noreferrer" className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-f1red hover:border-f1red transition-all group shadow-lg overflow-hidden rounded-xl">
                            <Instagram className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-white transition-colors" />
                          </a>
                        )}
                        {host.email && (
                          <a href={`mailto:${host.email}`} className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-f1red hover:border-f1red transition-all group shadow-lg overflow-hidden rounded-xl">
                            <Mail className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-white transition-colors" />
                          </a>
                        )}
                      </div>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Separator Line */}
      <div className="w-full h-px bg-f1red/30 relative z-20" />

      {/* Episodes Feed (Timing Board) */}
      <section id="episodes" className="py-16 md:py-32 px-4 sm:px-6 relative bg-f1dark overflow-hidden">
        <AnimatedBackground opacity={0.4} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-end justify-between mb-8 md:mb-12 border-b border-white/10 pb-4 md:pb-6">
            <div>
              <p className="text-f1red font-mono font-bold tracking-widest uppercase mb-1 md:mb-2 text-sm md:text-base">Archiv</p>
              <h3 className="text-4xl sm:text-5xl md:text-7xl font-display font-black uppercase italic">Letzte Ausgaben</h3>
            </div>
            <Timer className="w-8 h-8 md:w-12 md:h-12 text-white/20" />
          </div>
          
          <div className="flex flex-col gap-6">
            {displayedEpisodes.map((episode, i) => (
              <ArchiveEpisodeCard 
                key={episode.id} 
                episode={episode} 
                info={info} 
                platforms={platforms} 
                index={i} 
              />
            ))}
          </div>

          {visibleEpisodes < otherEpisodes.length && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setVisibleEpisodes(prev => prev + 3)}
                className="bg-white/5 hover:bg-f1red text-white px-8 py-4 font-display font-bold uppercase tracking-widest text-lg flex items-center gap-2 transition-all border border-white/10 hover:border-f1red shadow-lg rounded-xl"
              >
                <ChevronDown className="w-5 h-5" />
                Mehr laden
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t-4 border-f1red bg-f1gray text-center text-gray-500 text-sm font-mono flex flex-col items-center gap-6">
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
    </div>
  );
}
