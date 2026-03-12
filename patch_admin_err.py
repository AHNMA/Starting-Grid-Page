with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

find_episodes_map = "episodes.map(episode =>"
repl_episodes_map = "(Array.isArray(episodes) ? episodes : []).map(episode =>"
content = content.replace(find_episodes_map, repl_episodes_map)

# Also when fetching, make sure it's an array
# In handleFetchData
find_set_episodes = "const e = await fetch('/api/episodes').then(r => r.json());\n        setEpisodes(e);"
repl_set_episodes = "const e = await fetch('/api/episodes').then(r => r.json());\n        setEpisodes(Array.isArray(e) ? e : []);"
content = content.replace(find_set_episodes, repl_set_episodes)

find_set_episodes2 = "setEpisodes(e);"
repl_set_episodes2 = "setEpisodes(Array.isArray(e) ? e : []);"
# Careful not to replace randomly.
# Let's use re or just replace the specific block if it exists
with open('src/pages/Admin.tsx', 'w') as f:
    f.write(content)
