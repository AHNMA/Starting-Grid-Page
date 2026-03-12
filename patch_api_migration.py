with open('public/api.php', 'r') as f:
    content = f.read()

migration_sql = """
        // Add slug column to existing episodes table if it doesn't exist
        try {
            $stmt = $pdo->query("SHOW COLUMNS FROM episodes LIKE 'slug'");
            if ($stmt->rowCount() === 0) {
                $pdo->exec("ALTER TABLE episodes ADD COLUMN slug VARCHAR(255) UNIQUE");

                // Generate slugs for existing episodes
                $existing = $pdo->query("SELECT id, title FROM episodes")->fetchAll();
                foreach ($existing as $ep) {
                    $slug = ensureUniqueSlug($pdo, generateSlug($ep['title']), $ep['id']);
                    $pdo->prepare("UPDATE episodes SET slug = ? WHERE id = ?")->execute([$slug, $ep['id']]);
                }
            }
        } catch (PDOException $e) {
            // Ignore if table doesn't exist yet
        }
"""

content = content.replace("        // Check if podcast_info is seeded", migration_sql + "\n        // Check if podcast_info is seeded")

with open('public/api.php', 'w') as f:
    f.write(content)
