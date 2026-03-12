with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

content = content.replace("...episodes", "...(Array.isArray(episodes) ? episodes : [])")
content = content.replace("...hosts", "...(Array.isArray(hosts) ? hosts : [])")
content = content.replace("...platforms", "...(Array.isArray(platforms) ? platforms : [])")

# Let's fix missing ones like setEpisodes(episodes.map
content = content.replace("setEpisodes(episodes.map", "setEpisodes((Array.isArray(episodes) ? episodes : []).map")
content = content.replace("setHosts(hosts.map", "setHosts((Array.isArray(hosts) ? hosts : []).map")
content = content.replace("setPlatforms(platforms.map", "setPlatforms((Array.isArray(platforms) ? platforms : []).map")

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(content)
