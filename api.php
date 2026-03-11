<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Lade die bestehende Konfiguration
require_once __DIR__ . '/config.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // --- 1. DATENBANK-TABELLEN ERSTELLEN ---
    $pdo->exec("CREATE TABLE IF NOT EXISTS podcast_info (
        id INT PRIMARY KEY, title VARCHAR(255), description TEXT, cover_image VARCHAR(255), 
        logo_image VARCHAR(255), about_text TEXT, about_image VARCHAR(255), seo_title VARCHAR(255), 
        seo_description TEXT, seo_keywords TEXT
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS hosts (
        id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255), bio TEXT, image_url VARCHAR(255), 
        twitter_url VARCHAR(255), instagram_url VARCHAR(255), email VARCHAR(255)
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS episodes (
        id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255), description TEXT, audio_url VARCHAR(255), 
        published_at DATE, is_hero BOOLEAN DEFAULT 0, guid VARCHAR(255) UNIQUE, duration VARCHAR(50), 
        image_url VARCHAR(255)
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS platforms (
        id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255), url VARCHAR(255), icon_name VARCHAR(50), 
        icon_url LONGTEXT, display_order INT DEFAULT 0
    )");

    // Startdaten einfügen, falls die Tabelle leer ist
    $stmt = $pdo->query("SELECT COUNT(*) FROM podcast_info");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO podcast_info (id, title, description, cover_image, logo_image, about_text, about_image) VALUES (1, 'Starting Grid - Der Formel-1-Podcast', 'Der wöchentliche Formel-1-Podcast mit Kevin Scheuren und Dennis Lewandowski. Wir besprechen alles rund um die Königsklasse des Motorsports.', 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/0b4d4559-4592-4217-91a0-5e36746f3d9b/startinggrid_logo.png', '', 'Wir sind Starting Grid, der Formel-1-Podcast. Hier gibt es jede Woche die neuesten Infos, Analysen und Meinungen zur Königsklasse des Motorsports.', '')");
        
        $pdo->exec("INSERT INTO hosts (name, bio, image_url, twitter_url, instagram_url) VALUES 
        ('Kevin Scheuren', 'Motorsport-Enthusiast und Podcaster aus Leidenschaft. Verfolgt die Formel 1 seit den 90ern.', 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/0b4d4559-4592-4217-91a0-5e36746f3d9b/sg_boldpredictions_2024.png', 'https://twitter.com', 'https://instagram.com'),
        ('Dennis Lewandowski', 'Experte für Technik und Strategie in der Formel 1. Analysiert jedes Rennen bis ins kleinste Detail.', 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/0b4d4559-4592-4217-91a0-5e36746f3d9b/sg_fahrerranking_2025.png', 'https://twitter.com', 'https://instagram.com')");

        $pdo->exec("INSERT INTO platforms (name, url, icon_name, display_order) VALUES 
        ('Spotify', 'https://open.spotify.com/show/248DTJayGh73lX1bXAhBRa?si=JpNmmoDvQva6lram6n0cqw&dl_branch=1', 'spotify', 1),
        ('Apple Podcasts', 'https://itunes.apple.com/de/podcast/starting-grid/id1058868792?mt=2', 'apple', 2),
        ('YouTube', 'https://www.youtube.com/@startinggrid_f1', 'youtube', 3),
        ('RTL+', 'https://plus.rtl.de/podcast/starting-grid-l0j19z3kz1247', 'rtl', 4),
        ('Deezer', 'https://deezer.com/show/1006282', 'deezer', 5),
        ('meinsportpodcast.de', 'https://meinsportpodcast.de/motorsport/starting-grid/', 'rss', 6)");
    }

    // --- 2. API ENDPUNKTE BEREITSTELLEN ---
    $endpoint = $_GET['endpoint'] ?? '';

    if ($endpoint === 'podcast') {
        $stmt = $pdo->query("SELECT * FROM podcast_info WHERE id = 1");
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } elseif ($endpoint === 'hosts') {
        $stmt = $pdo->query("SELECT * FROM hosts");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($endpoint === 'episodes') {
        $stmt = $pdo->query("SELECT id, title, description, audio_url, DATE_FORMAT(published_at, '%Y-%m-%d') as published_at, is_hero, duration, image_url FROM episodes ORDER BY published_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } elseif ($endpoint === 'platforms') {
        $stmt = $pdo->query("SELECT * FROM platforms ORDER BY display_order ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Datenbank-Fehler", "message" => $e->getMessage()]);
}
?>
