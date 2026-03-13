import React, { useEffect, useState } from 'react';
import { PodcastInfo, Host, Episode, Platform, MediaFile } from '../types';
import { Save, Plus, Trash2, Edit2, Check, X, Upload, Settings, Users, Mic, Rss, Image as LucideImage, RefreshCw, ArrowUpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import Notification from '../components/Notification';

export default function Admin() {
  const [info, setInfo] = useState<PodcastInfo | null>(null);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);


  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'about' | 'hosts' | 'episodes' | 'platforms' | 'media'>('info');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        return data.url;
      } else {
        showNotification('Fehler beim Upload: ' + data.error, 'error');
        return null;
      }
    } catch (err) {
      console.error(err);
      showNotification('Upload fehlgeschlagen. Stelle sicher, dass die upload.php auf dem Server liegt und CORS erlaubt ist.', 'error');
      return null;
    }
  };

  const handleImportRSS = async (limit?: number) => {
    setLoading(true);
    try {
      const url = limit ? `/api/admin/rss-import?limit=${limit}` : '/api/admin/rss-import';
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification(`${data.imported} Episoden importiert!`, 'success');
        // Refresh episodes
        const e = await fetch('/api/episodes').then(r => r.json());
        setEpisodes(Array.isArray(e) ? e : []);
      } else {
        showNotification('Fehler beim Import: ' + data.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Import fehlgeschlagen.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMediaFiles(data);
      }
    } catch (error) {
      console.error('Failed to load media files:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      const [i, h, e, p] = await Promise.all([
        fetch('/api/podcast').then(r => r.json()),
        fetch('/api/hosts').then(r => r.json()),
        fetch('/api/episodes').then(r => r.json()),
        fetch('/api/platforms').then(r => r.json()),
        loadMedia()
      ]);

      setInfo(i);
      setHosts(Array.isArray(h) ? h : []);
      setEpisodes(e);
      setPlatforms(Array.isArray(p) ? p : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);


  // --- Media Center Handlers ---
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showNotification('Bild erfolgreich hochgeladen', 'success');
        loadMedia(); // Reload media
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      showNotification(error.message || 'Fehler beim Upload', 'error');
    } finally {
      setIsUploadingMedia(false);
      e.target.value = '';
    }
  };

  const deleteMedia = async (filename: string) => {
    try {
      const res = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });

      if (res.ok) {
        showNotification('Bild gelöscht', 'success');
        loadMedia();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Fehler beim Löschen');
      }
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  const confirmDeleteMedia = (file: MediaFile) => {
    const message = file.inUse
      ? `Achtung: Das Bild "${file.name}" wird aktuell verwendet. Wenn du es löschst, wird es an den entsprechenden Stellen auf der Webseite fehlen. Möchtest du es wirklich löschen?`
      : `Möchtest du das Bild "${file.name}" wirklich löschen?`;

    setModalConfig({
      isOpen: true,
      title: 'Bild löschen',
      message,
      confirmText: 'Löschen',
      onConfirm: () => {
        deleteMedia(file.name);
        setModalConfig(null);
      }
    });
  };

  const handleRenameMedia = async (file: MediaFile) => {
    const newName = window.prompt(`Neuer Dateiname für "${file.name}":`, file.name);
    if (!newName || newName === file.name) return;

    try {
      const res = await fetch('/api/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName: file.name, newName })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('Bild erfolgreich umbenannt', 'success');
        fetchAllData();
      } else {
        throw new Error(data.error || 'Fehler beim Umbenennen');
      }
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };


  const handleSaveInfo = async () => {
    if (!info) return;
    await fetch('/api/podcast', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info)
    });
    showNotification('Info gespeichert!', 'success');
  };

  const handleSaveHost = async (host: Host) => {
    await fetch(`/api/hosts/${host.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(host)
    });
    showNotification('Host gespeichert!', 'success');
  };

  const handleSaveEpisode = async (episode: Episode) => {
    if (episode.id === 0) {
      const res = await fetch('/api/episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(episode)
      });
      const data = await res.json();
      setEpisodes((Array.isArray(episodes) ? episodes : []).map(e => e.id === 0 ? { ...e, id: data.id } : e));
    } else {
      await fetch(`/api/episodes/${episode.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(episode)
      });
    }
    showNotification('Episode gespeichert!', 'success');
  };

  const handleDeleteEpisode = async (id: number) => {
    setModalConfig({
      isOpen: true,
      title: 'Episode löschen',
      message: 'Möchtest du diese Episode wirklich unwiderruflich löschen?',
      confirmText: 'Löschen',
      onConfirm: async () => {
        await fetch(`/api/episodes/${id}`, { method: 'DELETE' });
        setEpisodes((Array.isArray(episodes) ? episodes : []).filter(e => e.id !== id));
        setModalConfig(null);
        showNotification('Episode gelöscht!', 'success');
      }
    });
  };

  const handleClearEpisodes = async () => {
    setModalConfig({
      isOpen: true,
      title: 'Alle Episoden löschen',
      message: 'ACHTUNG: Möchtest du wirklich ALLE Episoden unwiderruflich löschen? Dies kann nicht rückgängig gemacht werden.',
      confirmText: 'Alles löschen',
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/admin/episodes/clear', { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            setEpisodes([]);
            showNotification('Alle Episoden gelöscht!', 'success');
          } else {
            showNotification('Fehler beim Löschen: ' + data.error, 'error');
          }
        } catch (err) {
          console.error(err);
          showNotification('Löschen fehlgeschlagen.', 'error');
        } finally {
          setLoading(false);
          setModalConfig(null);
        }
      }
    });
  };

  const handleSavePlatform = async (platform: Platform) => {
    try {
      await fetch(`/api/platforms/${platform.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platform)
      });
      showNotification('Plattform gespeichert!', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Fehler beim Speichern.', 'error');
    }
  };

  const handlePlatformIconUpload = async (platformId: number, file: File) => {
    const formData = new FormData();
    formData.append('icon', file);
    
    try {
      const res = await fetch(`/api/platforms/${platformId}/icon`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPlatforms((Array.isArray(platforms) ? platforms : []).map(p => p.id === platformId ? { ...p, icon_url: data.icon_url } : p));
        showNotification('Icon hochgeladen!', 'success');
      } else {
        showNotification('Fehler beim Upload: ' + data.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Upload fehlgeschlagen.', 'error');
    }
  };

  const handleAddPlatform = async () => {
    const newPlatform = {
      name: 'Neue Plattform',
      url: '',
      display_order: platforms.length + 1
    };
    
    try {
      const res = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlatform)
      });
      const data = await res.json();
      if (data.success) {
        setPlatforms([...(Array.isArray(platforms) ? platforms : []), { ...newPlatform, id: data.id, icon_name: 'rss' }]);
        showNotification('Plattform hinzugefügt!', 'success');
      }
    } catch (err) {
      console.error(err);
      showNotification('Fehler beim Hinzufügen.', 'error');
    }
  };

  const handleDeletePlatform = (id: number) => {
    setModalConfig({
      isOpen: true,
      title: 'Plattform löschen',
      message: 'Möchtest du diese Plattform wirklich löschen? Das kann nicht rückgängig gemacht werden.',
      confirmText: 'Löschen',
      onConfirm: async () => {
        try {
          await fetch(`/api/platforms/${id}`, { method: 'DELETE' });
          setPlatforms((Array.isArray(platforms) ? platforms : []).filter(p => p.id !== id));
          showNotification('Plattform gelöscht!', 'success');
        } catch (err) {
          console.error(err);
          showNotification('Fehler beim Löschen.', 'error');
        }
        setModalConfig(null);
      }
    });
  };

  const addEpisode = () => {
    setEpisodes([{
      id: 0,
      title: 'Neue Episode',
      description: '',
      audio_url: '',
      published_at: new Date().toISOString().split('T')[0],
      is_hero: false
    }, ...(Array.isArray(episodes) ? episodes : [])]);
  };

  if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center p-8 text-white">Lade Admin...</div>;

  return (
    <div className="min-h-screen bg-[#141414]/80 backdrop-blur-md text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-black uppercase italic">Admin Dashboard</h1>
          <Link to="/" className="text-red-500 hover:text-red-400 font-bold uppercase tracking-widest text-sm">Zurück zur Website</Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('info')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'info' ? 'border-b-2 border-red-600 text-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
            Website-Einstellungen
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-6 py-4 font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'about' ? 'border-b-2 border-red-600 text-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
            Über uns
          </button>
          <button 
            onClick={() => setActiveTab('hosts')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'hosts' ? 'border-b-2 border-red-600 text-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            Hosts
          </button>
          <button 
            onClick={() => setActiveTab('episodes')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'episodes' ? 'border-b-2 border-red-600 text-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Mic className="w-5 h-5" />
            Episoden
          </button>
          <button 
            onClick={() => setActiveTab('platforms')} 
            className={`flex items-center gap-2 px-6 py-4 font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'platforms' ? 'border-b-2 border-red-600 text-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Upload className="w-5 h-5" />
            Plattformen
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-6 py-4 font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'media' ? 'border-b-2 border-red-600 text-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            <LucideImage className="w-4 h-4" />
            Media
          </button>

        </div>

        {/* Website Settings */}
        {activeTab === 'info' && (
          <section className="mb-16 bg-white/5 p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold uppercase italic mb-6 flex items-center gap-3">
            <span className="w-8 h-1 bg-red-600" />
            Website-Einstellungen
          </h2>
          {info && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Website Titel (Meta Title)</label>
                <input 
                  type="text" 
                  value={info.seo_title || ''}
                  onChange={e => setInfo({ ...info, seo_title: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                  placeholder="Starting Grid - Der Formel-1-Podcast"
                />
                <p className="text-[10px] text-gray-500 mt-1">Empfohlen: 50-60 Zeichen</p>
              </div>
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Website Beschreibung (Meta Description)</label>
                <textarea 
                  value={info.seo_description || ''}
                  onChange={e => setInfo({ ...info, seo_description: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none h-32"
                  placeholder="Alles rund um die Formel 1..."
                />
                <p className="text-[10px] text-gray-500 mt-1">Empfohlen: 150-160 Zeichen</p>
              </div>
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Keywords (Kommagetrennt)</label>
                <input
                  type="text"
                  value={info.seo_keywords || ''}
                  onChange={e => setInfo({ ...info, seo_keywords: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                  placeholder="Formel 1, Podcast, Motorsport, Racing"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Favicon (16x16 oder 32x32)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={info.favicon_image || ''}
                    onChange={e => setInfo({ ...info, favicon_image: e.target.value })}
                    className="flex-1 bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    placeholder="Wird als kleines Icon im Browser-Tab angezeigt"
                  />
                  <label className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const url = await handleImageUpload(e.target.files[0]);
                        if (url) setInfo({ ...info, favicon_image: url });
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Globales Social-Media-Bild (Open Graph/X)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={info.social_image || ''}
                    onChange={e => setInfo({ ...info, social_image: e.target.value })}
                    className="flex-1 bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    placeholder="Optional: Ein Bild für geteilte Links auf Plattformen"
                  />
                  <label className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const url = await handleImageUpload(e.target.files[0]);
                        if (url) setInfo({ ...info, social_image: url });
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Podcast Cover Image (Quadratisch)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={info.cover_image || ''}
                    onChange={e => setInfo({ ...info, cover_image: e.target.value })}
                    className="flex-1 bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                  />
                  <label className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const url = await handleImageUpload(e.target.files[0]);
                        if (url) setInfo({ ...info, cover_image: url });
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Header Logo URL (Transparentes PNG/SVG)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={info.logo_image || ''} 
                    onChange={e => setInfo({ ...info, logo_image: e.target.value })}
                    className="flex-1 bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    placeholder="Optional: Ersetzt den Text 'Starting Grid' oben in der Leiste"
                  />
                  <label className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const url = await handleImageUpload(e.target.files[0]);
                        if (url) setInfo({ ...info, logo_image: url });
                      }
                    }} />
                  </label>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!info) return;
                  await fetch('/api/podcast', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(info)
                  });
                  showNotification('Website-Einstellungen gespeichert!', 'success');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Speichern
              </button>
            </div>
          )}
          </section>
        )}

        {/* About Section */}
        {activeTab === 'about' && (
          <section className="mb-16 bg-white/5 p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold uppercase italic mb-6 flex items-center gap-3">
            <span className="w-8 h-1 bg-red-600" />
            Über uns (Bio)
          </h2>
          {info && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Über uns Text (Bio)</label>
                <textarea 
                  value={info.about_text || ''} 
                  onChange={e => setInfo({ ...info, about_text: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none h-32"
                  placeholder="Ein kurzer Text über den Podcast..."
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Über uns Bild URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={info.about_image || ''} 
                    onChange={e => setInfo({ ...info, about_image: e.target.value })}
                    className="flex-1 bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    placeholder="Optional: Ein Bild für den Über-uns-Bereich"
                  />
                  <label className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const url = await handleImageUpload(e.target.files[0]);
                        if (url) setInfo({ ...info, about_image: url });
                      }
                    }} />
                  </label>
                </div>
              </div>
              <button 
                onClick={async () => {
                  if (!info) return;
                  await fetch('/api/podcast', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(info)
                  });
                  showNotification('Über-uns-Einstellungen gespeichert!', 'success');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Speichern
              </button>
            </div>
          )}
          </section>
        )}


        {/* Hosts */}
        {activeTab === 'hosts' && (
          <section className="mb-16 bg-white/5 p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold uppercase italic mb-6 flex items-center gap-3">
            <span className="w-8 h-1 bg-red-600" />
            Hosts
          </h2>
          <div className="space-y-8">
            {(Array.isArray(hosts) ? hosts : []).map(host => (
              <div key={host.id} className="p-6 border border-white/10 rounded-2xl bg-[#141414]">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Name</label>
                    <input 
                      type="text" 
                      value={host.name} 
                      onChange={e => setHosts((Array.isArray(hosts) ? hosts : []).map(h => h.id === host.id ? { ...h, name: e.target.value } : h))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={host.image_url} 
                        onChange={e => setHosts((Array.isArray(hosts) ? hosts : []).map(h => h.id === host.id ? { ...h, image_url: e.target.value } : h))}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                      />
                      <label className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5" />
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const url = await handleImageUpload(e.target.files[0]);
                            if (url) setHosts((Array.isArray(hosts) ? hosts : []).map(h => h.id === host.id ? { ...h, image_url: url } : h));
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-mono text-gray-400 mb-2">Bio</label>
                  <textarea 
                    value={host.bio} 
                    onChange={e => setHosts((Array.isArray(hosts) ? hosts : []).map(h => h.id === host.id ? { ...h, bio: e.target.value } : h))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none h-24"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">X (Twitter) URL</label>
                    <input 
                      type="text" 
                      value={host.twitter_url} 
                      onChange={e => setHosts((Array.isArray(hosts) ? hosts : []).map(h => h.id === host.id ? { ...h, twitter_url: e.target.value } : h))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Instagram URL</label>
                    <input 
                      type="text" 
                      value={host.instagram_url} 
                      onChange={e => setHosts((Array.isArray(hosts) ? hosts : []).map(h => h.id === host.id ? { ...h, instagram_url: e.target.value } : h))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">E-Mail Adresse</label>
                    <input 
                      type="email" 
                      value={host.email || ''} 
                      onChange={e => setHosts((Array.isArray(hosts) ? hosts : []).map(h => h.id === host.id ? { ...h, email: e.target.value } : h))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleSaveHost(host)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Host Speichern
                </button>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Episodes */}
        {activeTab === 'episodes' && (
          <section className="mb-16 bg-white/5 p-8 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold uppercase italic flex items-center gap-3">
              <span className="w-8 h-1 bg-red-600" />
              Episoden
            </h2>
            <div className="flex gap-3">
              <button 
                onClick={handleClearEpisodes}
                className="bg-red-900/50 hover:bg-red-900 text-red-500 hover:text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Alle löschen
              </button>
              <button 
                onClick={() => handleImportRSS()}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
              >
                <Rss className="w-4 h-4" /> Alle (RSS)
              </button>
              <button
                onClick={() => handleImportRSS(1)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
              >
                <Rss className="w-4 h-4" /> Neueste (RSS)
              </button>
              <button 
                onClick={addEpisode}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Neue Episode
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {(Array.isArray(episodes) ? episodes : []).map(episode => (
              <div key={episode.id} className="p-6 border border-white/10 rounded-2xl bg-[#141414]">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Titel</label>
                    <input 
                      type="text" 
                      value={episode.title} 
                      onChange={e => setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, title: e.target.value } : ep))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Audio URL</label>
                    <input 
                      type="text" 
                      value={episode.audio_url} 
                      onChange={e => setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, audio_url: e.target.value } : ep))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-mono text-gray-400 mb-2">Bild URL (Optional)</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={episode.image_url || ''} 
                      onChange={e => setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, image_url: e.target.value } : ep))}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                      placeholder="https://..."
                    />
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleImageUpload(file);
                            if (url) setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, image_url: url } : ep));
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-bold flex items-center gap-2 h-full">
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {episode.image_url && (
                    <div className="mt-4 w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                      <img src={episode.image_url} alt="Episode Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-mono text-gray-400 mb-2">URL-Slug (leer für Auto-Generierung)</label>
                  <input
                    type="text"
                    value={episode.slug || ''}
                    onChange={e => setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, slug: e.target.value } : ep))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none mb-4"
                  />
                  <label className="block text-sm font-mono text-gray-400 mb-2">Beschreibung</label>
                  <textarea 
                    value={episode.description} 
                    onChange={e => setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, description: e.target.value } : ep))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none h-24"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Veröffentlichungsdatum</label>
                    <input 
                      type="date" 
                      value={episode.published_at} 
                      onChange={e => setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, published_at: e.target.value } : ep))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center mt-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!episode.is_hero} 
                        onChange={e => setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, is_hero: e.target.checked } : ep))}
                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-mono text-gray-400">Als Hero-Episode markieren</span>
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleSaveEpisode(episode)}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Speichern
                  </button>
                  <button 
                    onClick={() => handleDeleteEpisode(episode.id)}
                    className="bg-red-900/50 hover:bg-red-900 text-red-500 hover:text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Platforms */}
        {activeTab === 'platforms' && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                <Upload className="w-6 h-6 text-f1red" /> Plattformen verwalten
              </h2>
              <button 
                onClick={handleAddPlatform}
                className="bg-f1red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors uppercase tracking-wider text-sm"
              >
                <Plus className="w-4 h-4" /> Neue Plattform
              </button>
            </div>
            <div className="grid gap-6">
              {platforms.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(platform => (
                <div key={platform.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden relative group shrink-0">
                      {platform.icon_url ? (
                        <img src={platform.icon_url} alt={platform.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="text-xs text-gray-500">{platform.icon_name}</span>
                      )}
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-6 h-6 text-white" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handlePlatformIconUpload(platform.id, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={platform.name} 
                        onChange={e => setPlatforms((Array.isArray(platforms) ? platforms : []).map(p => p.id === platform.id ? { ...p, name: e.target.value } : p))}
                        className="text-xl font-bold bg-transparent border-b border-transparent hover:border-white/20 focus:border-red-500 outline-none w-full"
                        placeholder="Plattform Name"
                      />
                    </div>
                    <button 
                      onClick={() => handleDeletePlatform(platform.id)}
                      className="text-red-500 hover:text-red-400 p-2"
                      title="Löschen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <label className="block text-sm font-mono text-gray-400 mb-2">Link URL</label>
                        <input 
                          type="text" 
                          value={platform.url} 
                          onChange={e => setPlatforms((Array.isArray(platforms) ? platforms : []).map(p => p.id === platform.id ? { ...p, url: e.target.value } : p))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-mono text-gray-400 mb-2">Reihenfolge</label>
                        <input 
                          type="number" 
                          value={platform.display_order || 0} 
                          onChange={e => setPlatforms((Array.isArray(platforms) ? platforms : []).map(p => p.id === platform.id ? { ...p, display_order: parseInt(e.target.value) } : p))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleSavePlatform(platform)}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Speichern
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* --- Media Center Tab --- */}
        {activeTab === 'media' && (
          <section className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-1">Media Center</h2>
                <p className="text-gray-400">Verwalte alle hochgeladenen Bilder im Ordner "upload".</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  id="media-upload"
                  className="hidden"
                  onChange={handleMediaUpload}
                  disabled={isUploadingMedia}
                />
                <label
                  htmlFor="media-upload"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-bold uppercase tracking-wider transition-colors cursor-pointer group"
                >
                  {isUploadingMedia ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowUpCircle className="w-4 h-4 transition-transform group-hover:-translate-y-1" />}
                  {isUploadingMedia ? 'Lädt...' : 'Bild hochladen'}
                </label>
              </div>
            </div>

            {mediaFiles.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900/50 border border-red-600/20">
                <p className="text-gray-400">Keine Bilder im Upload-Ordner gefunden.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {mediaFiles.map((file) => (
                  <div key={file.name} className="bg-zinc-900 border border-zinc-800 hover:border-red-600/50 transition-colors group relative flex flex-col">

                    {/* Visual indicator for 'in use' */}
                    <div
                      className={`absolute top-2 right-2 z-10 w-3 h-3 rounded-full ${file.inUse ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}
                      title={file.inUse ? 'Wird aktuell verwendet' : 'Nicht in Verwendung'}
                    ></div>

                    <div className="aspect-square relative overflow-hidden bg-zinc-950 p-2 flex items-center justify-center">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-3 flex flex-col flex-1">
                      <div className="text-xs text-gray-300 truncate mb-1" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[10px] text-gray-500 mb-3">
                        {(file.size / 1024).toFixed(1)} KB • {new Date(file.modified * 1000).toLocaleDateString()}
                      </div>

                      <div className="flex justify-between items-center mt-auto">
                        <button
                          onClick={() => handleRenameMedia(file)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors rounded"
                          title="Umbenennen"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => confirmDeleteMedia(file)}
                          className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 transition-colors rounded"
                          title="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}


      </div>

      {modalConfig && (
        <Modal 
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          onClose={() => setModalConfig(null)}
          onConfirm={modalConfig.onConfirm}
        />
      )}

      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
