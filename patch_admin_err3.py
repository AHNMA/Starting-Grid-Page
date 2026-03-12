with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

find_episodes_map = "episodes.map(e => e.id"
repl_episodes_map = "(Array.isArray(episodes) ? episodes : []).map(e => e.id"
content = content.replace(find_episodes_map, repl_episodes_map)

find_episodes_filter = "episodes.filter(e =>"
repl_episodes_filter = "(Array.isArray(episodes) ? episodes : []).filter(e =>"
content = content.replace(find_episodes_filter, repl_episodes_filter)

find_hosts_filter = "hosts.filter(h =>"
repl_hosts_filter = "(Array.isArray(hosts) ? hosts : []).filter(h =>"
content = content.replace(find_hosts_filter, repl_hosts_filter)

find_hosts_map2 = "hosts.map(h =>"
repl_hosts_map2 = "(Array.isArray(hosts) ? hosts : []).map(h =>"
content = content.replace(find_hosts_map2, repl_hosts_map2)

find_platforms_filter = "platforms.filter(p =>"
repl_platforms_filter = "(Array.isArray(platforms) ? platforms : []).filter(p =>"
content = content.replace(find_platforms_filter, repl_platforms_filter)

find_platforms_map2 = "platforms.map(p =>"
repl_platforms_map2 = "(Array.isArray(platforms) ? platforms : []).map(p =>"
content = content.replace(find_platforms_map2, repl_platforms_map2)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(content)
