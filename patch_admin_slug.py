with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

find_title_input = """                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Titel</label>
                    <input
                      type="text"
                      value={episode.title}
                      onChange={e => setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, title: e.target.value } : ep))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>"""

repl_title_input = """                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Titel</label>
                    <input
                      type="text"
                      value={episode.title}
                      onChange={e => setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, title: e.target.value } : ep))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">URL Slug (Unterseite)</label>
                    <input
                      type="text"
                      value={episode.slug || ''}
                      onChange={e => setEpisodes((Array.isArray(episodes) ? episodes : []).map(ep => ep.id === episode.id ? { ...ep, slug: e.target.value } : ep))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none font-mono text-sm"
                      placeholder="wird-automatisch-generiert"
                    />
                  </div>"""

content = content.replace(find_title_input, repl_title_input)

# Also we need to make sure the grid columns is adjusted from 2 to 3 maybe?
# The wrapper is: <div className="grid md:grid-cols-2 gap-4 mb-4">
find_grid = """                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Titel</label>"""
repl_grid = """                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Titel</label>"""
content = content.replace(find_grid, repl_grid)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(content)
