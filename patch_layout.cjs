const fs = require('fs');

let code = fs.readFileSync('src/pages/EpisodeDetail.tsx', 'utf8');

// The block to replace
const oldLayout = `              {/* Image Section */}
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
                )}`;

const newLayout = `              {/* Meta Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] md:text-sm font-mono text-f1red font-bold uppercase tracking-widest mb-4 w-full">
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
              <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-lg mb-6 w-full">
                {episode.title}
              </h1>

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
                  </div>
                )}
              </div>

              {/* Description Wrapper */}
              <div className="w-full flex flex-col">`;

code = code.replace(oldLayout, newLayout);

fs.writeFileSync('src/pages/EpisodeDetail.tsx', code);
