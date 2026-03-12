with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

# Make sure we don't crash when API returns 500 for hosts
find_hosts = "hosts.map((host,"
repl_hosts = "(Array.isArray(hosts) ? hosts : []).map((host,"
content = content.replace(find_hosts, repl_hosts)

# Make sure we don't crash when API returns 500
find_episodes = "const heroEpisode = episodes.find(e => e.is_hero) || episodes[0];"
repl_episodes = "const safeEpisodes = Array.isArray(episodes) ? episodes : [];\n  const heroEpisode = safeEpisodes.find(e => e.is_hero) || safeEpisodes[0];"
content = content.replace(find_episodes, repl_episodes)
content = content.replace("const otherEpisodes = episodes.filter(e => e.id !== heroEpisode?.id);", "const otherEpisodes = safeEpisodes.filter(e => e.id !== heroEpisode?.id);")

# Platforms
find_platforms = "platforms.map(p =>"
repl_platforms = "(Array.isArray(platforms) ? platforms : []).map(p =>"
content = content.replace(find_platforms, repl_platforms)


with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
