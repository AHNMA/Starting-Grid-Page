with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

find_set_platforms = "setPlatforms(p);"
repl_set_platforms = "setPlatforms(Array.isArray(p) ? p : []);"
content = content.replace(find_set_platforms, repl_set_platforms)

find_set_hosts = "setHosts(h);"
repl_set_hosts = "setHosts(Array.isArray(h) ? h : []);"
content = content.replace(find_set_hosts, repl_set_hosts)

find_platforms_map = "platforms.map(platform =>"
repl_platforms_map = "(Array.isArray(platforms) ? platforms : []).map(platform =>"
content = content.replace(find_platforms_map, repl_platforms_map)

find_hosts_map = "hosts.map(host =>"
repl_hosts_map = "(Array.isArray(hosts) ? hosts : []).map(host =>"
content = content.replace(find_hosts_map, repl_hosts_map)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(content)
