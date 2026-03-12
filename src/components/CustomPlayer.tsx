import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Episode } from '../types';
import { FaXTwitter } from 'react-icons/fa6';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Share2, Copy, MessageCircle, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomPlayerProps {
  episode: Episode;
}

function Visualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = Array.from({ length: 45 });
  
  return (
    <div className="flex items-center justify-center gap-[1px] sm:gap-[2px] h-6 sm:h-8 w-full my-4 px-2 overflow-hidden opacity-80">
      {bars.map((_, i) => {
        // Create a more speech-like pattern with varied frequencies
        const seed = i * 0.4;
        return (
          <motion.div
            key={i}
            className="w-1 bg-f1red/80 rounded-full shadow-[0_0_8px_rgba(225,6,0,0.3)]"
            animate={{
              height: isPlaying 
                ? [
                    (Math.sin(seed) * 25 + 45) + "%", 
                    (Math.cos(seed * 1.5) * 35 + 50) + "%", 
                    (Math.sin(seed * 0.8 + 1) * 30 + 40) + "%",
                    (Math.cos(seed * 2.1) * 20 + 60) + "%"
                  ] 
                : "10%"
            }}
            transition={{
              duration: 0.4 + (i % 5) * 0.1, // Varied durations for organic feel
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

export default function CustomPlayer({ episode }: CustomPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleActivePlayerChanged = (e: CustomEvent) => {
      if (e.detail !== episode.id) {
        setHasPlayed(false);
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener('active-player-changed', handleActivePlayerChanged as EventListener);
    return () => {
      window.removeEventListener('active-player-changed', handleActivePlayerChanged as EventListener);
    };
  }, [episode.id, isPlaying]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the container is out of view, we pin it
        setIsPinned(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.5;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onError = (e: Event) => {
      console.error("Audio playback error:", (e.target as HTMLAudioElement).error);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        setHasPlayed(true);
        window.dispatchEvent(new CustomEvent('active-player-changed', { detail: episode.id }));
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            if (error.name !== 'AbortError') {
              console.error("Playback failed:", error);
            }
            // Only reset if it wasn't an abort error, because an abort error 
            // means pause() was intentionally called.
            if (error.name !== 'AbortError') {
              setIsPlaying(false);
            }
          });
        }
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume > 0) {
        setIsMuted(false);
        audioRef.current.muted = false;
        setPreviousVolume(newVolume);
      } else {
        setIsMuted(true);
        audioRef.current.muted = true;
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (newMutedState) {
        setVolume(0);
      } else {
        const restoreVol = previousVolume > 0 ? previousVolume : 1;
        setVolume(restoreVol);
        audioRef.current.volume = restoreVol;
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;


  const shareUrl = episode.slug
    ? `${window.location.origin}/episode/${episode.slug}`
    : window.location.href;

  const handleShare = () => {
    setIsShareOpen(!isShareOpen);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOnX = () => {
    const text = encodeURIComponent(`Hör dir die neue Folge von Starting Grid an: ${episode.title}`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Hör dir die neue Folge von Starting Grid an: ${episode.title} ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const playerContent = (
    <div className={`spotify-card ${isPinned && hasPlayed ? 'is-pinned' : ''}`}>

      
      <button 
        onClick={handleShare}
        className="absolute top-4 right-4 text-gray-400 hover:text-f1red transition-colors p-1 z-10"
        title="Teilen"
      >
        <Share2 className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isShareOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute inset-0 z-20 bg-[#151515]/95 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-6 border border-f1red/30"
          >
            <button 
              onClick={() => setIsShareOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
            
            <h3 className="text-white font-bold uppercase italic mb-6 tracking-wider">Folge teilen</h3>
            
            <div className="flex gap-6 mb-8">
              <button 
                onClick={shareOnX}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-f1red transition-colors">
                  {/* @ts-expect-error type issue */}
<FaXTwitter className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-white">X</span>
              </button>
              
              <button 
                onClick={shareOnWhatsApp}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-white">WhatsApp</span>
              </button>
              
              <button 
                onClick={copyToClipboard}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <Copy className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-white">
                  {copySuccess ? 'Kopiert!' : 'Link'}
                </span>
              </button>
            </div>
            
            <div className="w-full bg-black/40 p-2 rounded border border-white/5 flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={shareUrl}
                className="bg-transparent text-[10px] text-gray-400 flex-1 outline-none truncate"
              />
              <button 
                onClick={copyToClipboard}
                className="text-f1red hover:text-white transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="spotify-top">
        <div className="spotify-title-1">{episode.title}</div>
        <div className="spotify-title-2">{new Date(episode.published_at).toLocaleDateString('de-DE')}</div>
      </div>

      <Visualizer isPlaying={isPlaying} />

      <div className="spotify-time-container">
        <div className="spotify-time" onClick={handleSeek}>
          <div className="spotify-elapsed" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <span className="timetext time-current">{formatTime(currentTime)}</span>
        <span className="timetext time-total">{formatTime(duration)}</span>
      </div>

      <div className="relative">
        <div className="spotify-controls">
          <button 
            className="spotify-btn flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-white transition-colors" 
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime -= 30;
            }}
            title="-30s"
          >
            30s <RotateCcw className="w-4 h-4" />
          </button>
          
          <button onClick={togglePlay} className="spotify-play-btn">
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white text-white" />
            ) : (
              <Play className="w-6 h-6 fill-white text-white ml-0.5" />
            )}
          </button>
          
          <button 
            className="spotify-btn flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-white transition-colors" 
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime += 30;
            }}
            title="+30s"
          >
            <RotateCw className="w-4 h-4" /> 30s
          </button>
        </div>

        <div className="spotify-volume">
          <div className="volume-slider-wrapper flex items-center justify-center w-8 h-28">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#e10600] -rotate-90 origin-center"
            />
          </div>
          <button onClick={toggleMute} className="focus:outline-none flex items-center justify-center p-2">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-gray-400 hover:text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-400 hover:text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .spotify-card {
          position: relative;
          width: 100%;
          background: #151515;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        @media (min-width: 768px) {
          .spotify-card {
            padding: 16px;
            min-height: auto;
          }
        }
        
        .spotify-card:hover {
          border-color: rgba(255,255,255,0.2);
          background: #1a1a1a;
        }

        .spotify-card.is-pinned {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 380px;
          z-index: 99999;
          box-shadow: 0 20px 40px rgba(0,0,0,0.8);
          animation: slideIn 0.3s ease-out forwards;
          background: rgba(21, 21, 21, 0.95);
          backdrop-filter: blur(10px);
        }

        @media (max-width: 768px) {
          .spotify-card.is-pinned {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            border-radius: 12px 12px 0 0;
            padding: 16px;
            z-index: 999999;
          }
        }

        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .spotify-top {
          position: relative;
          width: 100%;
          display: flex;
          gap: 0;
          align-items: flex-start;
          flex-direction: column;
          margin-bottom: 8px;
        }

        @media (min-width: 768px) {
          .spotify-top {
            margin-bottom: 4px;
          }
        }

        .spotify-title-1 {
          color: white;
          font-size: 16px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          width: 100%;
          text-transform: uppercase;
        }

        @media (min-width: 768px) {
          .spotify-title-1 {
            font-size: 18px;
          }
        }

        .spotify-title-2 {
          color: #9ca3af;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .spotify-time-container {
          width: 100%;
          margin-top: 0;
          margin-bottom: 24px;
          position: relative;
        }

        @media (min-width: 768px) {
          .spotify-time-container {
            margin-bottom: 20px;
          }
        }

        .spotify-time {
          width: 100%;
          background-color: #333;
          height: 4px;
          border-radius: 2px;
          cursor: pointer;
          position: relative;
        }

        .spotify-elapsed {
          background-color: #e10600;
          height: 100%;
          border-radius: 2px;
          position: relative;
        }
        
        .spotify-elapsed::after {
          content: '';
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .spotify-time:hover .spotify-elapsed::after {
          opacity: 1;
        }

        .spotify-controls {
          color: white;
          display: flex;
          width: 100%;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .spotify-controls {
            gap: 20px;
          }
        }

        .spotify-btn {
          cursor: pointer;
          transition: 0.2s;
          color: #d1d5db;
        }

        .spotify-btn:hover {
          color: white;
          transform: scale(1.1);
        }
        
        .spotify-play-btn {
          color: white;
          background: #e10600;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          transition: 0.2s;
          box-shadow: 0 4px 12px rgba(225, 6, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spotify-play-btn:hover {
          transform: scale(1.1);
          background: #ff0a00;
          box-shadow: 0 6px 16px rgba(225, 6, 0, 0.4);
        }

        .spotify-volume {
          position: absolute;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: 0.2s;
        }
        
        .spotify-card:hover .spotify-volume {
          opacity: 1;
        }

        .volume-slider-wrapper {
          position: absolute;
          bottom: 100%;
          right: 50%;
          transform: translateX(50%) translateY(10px);
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s;
          margin-bottom: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          z-index: 50;
        }

        .spotify-volume:hover .volume-slider-wrapper {
          opacity: 1;
          visibility: visible;
          transform: translateX(50%) translateY(0);
        }

        .timetext {
          color: #9ca3af;
          font-size: 10px;
          font-family: monospace;
          position: absolute;
          top: 8px;
        }
        
        .time-current { left: 0; }
        .time-total { right: 0; }
      `}</style>
      
      <audio ref={audioRef} src={episode.audio_url} preload="metadata" />
      <div ref={containerRef} className="w-full">
        {isPinned && hasPlayed 
          ? createPortal(playerContent, document.body) 
          : playerContent
        }
      </div>
    </>
  );
}
