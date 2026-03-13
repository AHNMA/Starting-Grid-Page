<?php
require_once __DIR__ . '/config.php';

// Try to load the basic info from database
$title = "Starting Grid - Der Formel-1-Podcast";
$description = "Der wöchentliche Formel-1-Podcast mit Kevin Scheuren und Dennis Lewandowski. Wir besprechen alles rund um die Königsklasse des Motorsports.";
$image = "https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/0b4d4559-4592-4217-91a0-5e36746f3d9b/startinggrid_logo.png";

$isEpisode = false;
$episodeTitle = "";
$episodeDescription = "";
$episodeImage = "";
$urlPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$fullUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'sg.letthemrace.net') . $urlPath;

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    // Fetch Podcast Info
    $stmt = $pdo->query("SELECT seo_title, seo_description, social_image, cover_image FROM podcast_info WHERE id = 1");
    if ($info = $stmt->fetch()) {
        $title = !empty($info['seo_title']) ? $info['seo_title'] : $title;
        $description = !empty($info['seo_description']) ? $info['seo_description'] : $description;
        $image = !empty($info['social_image']) ? $info['social_image'] : $info['cover_image'];
    }

    // Check if this is an episode page
    if (preg_match('@^/episode/([^/]+)@', $urlPath, $matches)) {
        $slug = $matches[1];
        $stmt = $pdo->prepare("SELECT title, description, image_url FROM episodes WHERE slug = ?");
        $stmt->execute([$slug]);
        if ($episode = $stmt->fetch()) {
            $isEpisode = true;
            $episodeTitle = $episode['title'] . " - Starting Grid";

            // Clean markdown/html from description for meta tags
            $desc = strip_tags($episode['description']);
            // Limit length
            $episodeDescription = mb_strimwidth($desc, 0, 160, '...');

            if (!empty($episode['image_url'])) {
                $episodeImage = $episode['image_url'];
            }
        }
    }

} catch (PDOException $e) {
    // Silently fallback to defaults if database fails
}

// Determine final meta values
$finalTitle = $isEpisode ? $episodeTitle : $title;
$finalDescription = $isEpisode && !empty($episodeDescription) ? $episodeDescription : $description;
$finalImage = ($isEpisode && !empty($episodeImage)) ? $episodeImage : $image;

// Make sure image URLs are absolute if they are relative
if (!empty($finalImage) && strpos($finalImage, 'http') !== 0) {
    $finalImage = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'sg.letthemrace.net') . $finalImage;
}

// Generate Meta Tags
$ogTags = "
    <meta property=\"og:title\" content=\"" . htmlspecialchars($finalTitle, ENT_QUOTES, 'UTF-8') . "\" />
    <meta property=\"og:description\" content=\"" . htmlspecialchars($finalDescription, ENT_QUOTES, 'UTF-8') . "\" />
    <meta property=\"og:type\" content=\"" . ($isEpisode ? "article" : "website") . "\" />
    <meta property=\"og:url\" content=\"" . htmlspecialchars($fullUrl, ENT_QUOTES, 'UTF-8') . "\" />
    <meta property=\"og:site_name\" content=\"Starting Grid\" />
";

if (!empty($finalImage)) {
    $ogTags .= "    <meta property=\"og:image\" content=\"" . htmlspecialchars($finalImage, ENT_QUOTES, 'UTF-8') . "\" />\n";
    $ogTags .= "    <meta property=\"og:image:alt\" content=\"Cover Bild\" />\n";
}

$twitterTags = "
    <meta name=\"twitter:card\" content=\"summary_large_image\" />
    <meta name=\"twitter:title\" content=\"" . htmlspecialchars($finalTitle, ENT_QUOTES, 'UTF-8') . "\" />
    <meta name=\"twitter:description\" content=\"" . htmlspecialchars($finalDescription, ENT_QUOTES, 'UTF-8') . "\" />
";

if (!empty($finalImage)) {
    $twitterTags .= "    <meta name=\"twitter:image\" content=\"" . htmlspecialchars($finalImage, ENT_QUOTES, 'UTF-8') . "\" />\n";
}

// Load built index.html
$htmlFile = __DIR__ . '/index.html';
if (!file_exists($htmlFile)) {
    // Fallback for development (although mostly run via Vite in dev)
    $htmlFile = dirname(__DIR__) . '/index.html';
}

if (file_exists($htmlFile)) {
    $html = file_get_contents($htmlFile);

    // Replace the <title> tag safely
    $html = preg_replace_callback('/<title>.*?<\/title>/i', function() use ($finalTitle) {
        return '<title>' . htmlspecialchars($finalTitle, ENT_QUOTES, 'UTF-8') . '</title>';
    }, $html);

    // Replace the <meta name="description"> tag safely
    $html = preg_replace_callback('/<meta name="description" content=".*?"\s*\/?>/i', function() use ($finalDescription) {
        return '<meta name="description" content="' . htmlspecialchars($finalDescription, ENT_QUOTES, 'UTF-8') . '" />';
    }, $html);

    // Inject OG and Twitter tags
    $html = str_replace('<!-- OG Placeholder -->', $ogTags, $html);
    $html = str_replace('<!-- Twitter Placeholder -->', $twitterTags, $html);

    echo $html;
} else {
    echo "Frontend build missing.";
}
