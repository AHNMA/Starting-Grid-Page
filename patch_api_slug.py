with open('public/api.php', 'r') as f:
    content = f.read()

# Update POST to accept slug
find_post_exec = """                $inputData['image_url'] ?? '',
                $inputData['duration'] ?? '',
                ensureUniqueSlug($pdo, generateSlug($inputData['title'] ?? ''))"""
repl_post_exec = """                $inputData['image_url'] ?? '',
                $inputData['duration'] ?? '',
                ensureUniqueSlug($pdo, !empty($inputData['slug']) ? generateSlug($inputData['slug']) : generateSlug($inputData['title'] ?? ''))"""

content = content.replace(find_post_exec, repl_post_exec)

# Update PUT to accept slug
find_put_exec = """                $inputData['image_url'] ?? '',
                $inputData['duration'] ?? '',
                ensureUniqueSlug($pdo, generateSlug($inputData['title'] ?? ''), $id),"""
repl_put_exec = """                $inputData['image_url'] ?? '',
                $inputData['duration'] ?? '',
                ensureUniqueSlug($pdo, !empty($inputData['slug']) ? generateSlug($inputData['slug']) : generateSlug($inputData['title'] ?? ''), $id),"""

content = content.replace(find_put_exec, repl_put_exec)

with open('public/api.php', 'w') as f:
    f.write(content)
