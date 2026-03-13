import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { PodcastInfo } from '../types';

export default function Impressum() {
  const [info, setInfo] = useState<PodcastInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/podcast')
      .then(res => {
        if (!res.ok) throw new Error('Netzwerk-Antwort war nicht ok');
        return res.json();
      })
      .then(data => {
        setInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fehler beim Laden des Impressums:", err);
        setError("Das Impressum konnte nicht geladen werden.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen text-white relative z-10 flex flex-col">
      <Helmet>
        <title>Impressum - {info?.title || 'Starting Grid'}</title>
      </Helmet>

      <Header info={info} />

      <main className="flex-1 max-w-[1200px] mx-auto px-6 w-full pt-20 pb-16 md:pt-32 md:pb-32">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-f1red hover:text-white transition-colors mb-12 font-mono uppercase tracking-wider"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Zurück zur Übersicht</span>
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-f1red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-8 text-center text-red-500 font-mono">
            {error}
          </div>
        ) : (
          <div className="relative group max-w-4xl mx-auto">
            <div className="relative bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 md:p-12 shadow-2xl overflow-hidden backdrop-blur-xl">

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                    Impressum
                  </h1>
                </div>

                <div className="prose prose-invert prose-p:text-gray-300 prose-a:text-f1red hover:prose-a:text-red-400 prose-a:no-underline prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wider prose-headings:text-white prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-li:text-gray-300 prose-strong:text-white max-w-none font-mono whitespace-pre-wrap">
                  {info?.imprint_text ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {info.imprint_text}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-400 font-mono text-sm">
                      Es wurde noch kein Impressum hinterlegt.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
