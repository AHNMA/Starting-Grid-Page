const fs = require('fs');

let code = fs.readFileSync('src/pages/EpisodeDetail.tsx', 'utf8');

// 1. Add Platform type import
if (!code.includes('PodcastPlatform')) {
    code = code.replace(
        "import { Episode, PodcastInfo } from '../types';",
        "import { Episode, PodcastInfo, PodcastPlatform } from '../types';"
    );
}

// 2. Add state
if (!code.includes('platforms, setPlatforms')) {
    code = code.replace(
        'const [info, setInfo] = useState<PodcastInfo | null>(null);',
        'const [info, setInfo] = useState<PodcastInfo | null>(null);\n  const [platforms, setPlatforms] = useState<PodcastPlatform[]>([]);'
    );
}

// 3. Update fetch
code = code.replace(
    /const \[epRes, infoRes\] = await Promise\.all\(\[\s+fetch\(`\/api\/episode\/\$\{slug\}`\),\s+fetch\('\/api\/podcast'\)\s+\]\);/s,
    `const [epRes, infoRes, platformsRes] = await Promise.all([
          fetch(\`/api/episode/\${slug}\`),
          fetch('/api/podcast'),
          fetch('/api/podcast-platforms')
        ]);`
);

code = code.replace(
    /const infoData = await infoRes\.json\(\);/s,
    `const infoData = await infoRes.json();
        const platformsData = await platformsRes.json();`
);

code = code.replace(
    /setInfo\(infoData\);/s,
    `setInfo(infoData);
        setPlatforms(platformsData);`
);

// 4. Add UI below Description
const descBlock = `                {/* Description */}
                <div className="mt-4 border-t border-white/10 pt-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Episoden-Notizen</h2>
                    <DynamicEpisodeText description={episode.description} className="text-xs md:text-sm font-mono text-gray-300 leading-relaxed" />
                </div>
              </div>`;

const platformUI = `                {/* Description */}
                <div className="mt-4 border-t border-white/10 pt-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Episoden-Notizen</h2>
                    <DynamicEpisodeText description={episode.description} className="text-xs md:text-sm font-mono text-gray-300 leading-relaxed" />
                </div>

                {/* Platforms */}
                {platforms && platforms.length > 0 && (
                  <div className="mt-8 border-t border-white/10 pt-8 w-full">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6">Auf anderen Plattformen hören</h2>
                    <div className="flex items-center gap-2 md:gap-4 w-full">
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
                                WebkitMaskImage: \`url(\${p.icon_url})\`,
                                WebkitMaskSize: 'contain',
                                WebkitMaskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'center',
                                maskImage: \`url(\${p.icon_url})\`,
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                              }}
                              title={p.name}
                            />
                          ) : (
                            <span className="text-gray-400 group-hover:text-white transition-colors font-mono text-xs uppercase font-bold tracking-widest truncate px-2">
                              {p.name}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>`;

code = code.replace(descBlock, platformUI);

fs.writeFileSync('src/pages/EpisodeDetail.tsx', code);
