<?php
require_once __DIR__ . '/config.php';

// Allow CORS for local dev
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Establish PDO MySQL Connection
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Datenbankverbindung fehlgeschlagen: " . $e->getMessage()]);
    exit;
}

// Ensure Upload Directory exists
$uploadDir = __DIR__ . '/upload';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Get the requested endpoint
$endpoint = isset($_GET['endpoint']) ? rtrim($_GET['endpoint'], '/') : '';
$method = $_SERVER['REQUEST_METHOD'];

// Parse JSON Body for POST/PUT requests
$inputData = [];
if ($method === 'POST' || $method === 'PUT') {
    $json = file_get_contents('php://input');
    if ($json) {
        $inputData = json_decode($json, true) ?? [];
    } else {
        $inputData = $_POST;
    }
}

// --- Helper Functions ---
function getPathParam($endpoint, $prefix) {
    $pattern = '@^' . preg_quote($prefix, '@') . '/([^/]+)$@';
    if (preg_match($pattern, $endpoint, $matches)) {
        return $matches[1];
    }
    return null;
}

// Handle Uploads locally
function handleUpload($fileArray) {
    global $uploadDir;

    if (!isset($fileArray['error']) || is_array($fileArray['error'])) {
        return ["success" => false, "error" => "Invalid parameters."];
    }

    if ($fileArray['error'] !== UPLOAD_ERR_OK) {
         return ["success" => false, "error" => "Upload failed with error code: " . $fileArray['error']];
    }

    // Strict validation for image file extensions
    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $ext = strtolower(pathinfo($fileArray['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, $allowedExts)) {
        return ["success" => false, "error" => "Invalid file type. Only JPG, JPEG, PNG, WEBP, and GIF are allowed."];
    }

    // Verify MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $fileArray['tmp_name']);
    finfo_close($finfo);

    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!in_array($mimeType, $allowedMimeTypes)) {
        return ["success" => false, "error" => "Invalid file content. Must be a valid image."];
    }

    $filename = uniqid('img_', true) . '.' . $ext;
    $targetPath = $uploadDir . '/' . $filename;

    if (move_uploaded_file($fileArray['tmp_name'], $targetPath)) {
        // Return a relative path accessible by frontend
        return ["success" => true, "url" => "/upload/" . $filename];
    } else {
        return ["success" => false, "error" => "Failed to move uploaded file."];
    }
}

// Handle endpoints
// Ensure database schema exists and is seeded
function ensureDatabaseInitialized($pdo) {
    try {
        $pdo->exec("
          CREATE TABLE IF NOT EXISTS podcast_info (
            id INT PRIMARY KEY,
            title VARCHAR(255),
            description TEXT,
            cover_image VARCHAR(255),
            logo_image VARCHAR(255),
            about_text TEXT,
            about_image VARCHAR(255),
            seo_title VARCHAR(255),
            seo_description TEXT,
            seo_keywords TEXT,
            favicon_image VARCHAR(255),
            social_image VARCHAR(255)
          )
        ");

        $pdo->exec("
          CREATE TABLE IF NOT EXISTS hosts (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255),
            bio TEXT,
            image_url VARCHAR(255),
            twitter_url VARCHAR(255),
            instagram_url VARCHAR(255),
            email VARCHAR(255)
          )
        ");

        $pdo->exec("
          CREATE TABLE IF NOT EXISTS episodes (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255),
            description TEXT,
            audio_url VARCHAR(255),
            published_at DATE,
            is_hero BOOLEAN DEFAULT 0,
            guid VARCHAR(255) UNIQUE,
            duration VARCHAR(50),
            image_url VARCHAR(255)
          )
        ");

        $pdo->exec("
          CREATE TABLE IF NOT EXISTS platforms (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255),
            url VARCHAR(255),
            icon_name VARCHAR(255),
            icon_url VARCHAR(255),
            display_order INT DEFAULT 0
          )
        ");

        // Check if podcast_info is seeded
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM podcast_info");
        $count = $stmt->fetch()['count'];

        if ($count == 0) {
             $pdo->exec("
                INSERT INTO podcast_info (id, title, description, cover_image, logo_image, about_text, about_image, favicon_image, social_image)
                VALUES (1, 'Starting Grid - Der Formel-1-Podcast', 'Der wöchentliche Formel-1-Podcast mit Kevin Scheuren und Dennis Lewandowski. Wir besprechen alles rund um die Königsklasse des Motorsports.', 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/0b4d4559-4592-4217-91a0-5e36746f3d9b/startinggrid_logo.png', '', 'Wir sind Starting Grid, der Formel-1-Podcast. Hier gibt es jede Woche die neuesten Infos, Analysen und Meinungen zur Königsklasse des Motorsports.', '', '', '')
             ");

             $pdo->exec("
                INSERT INTO hosts (name, bio, image_url, twitter_url, instagram_url)
                VALUES
                ('Kevin Scheuren', 'Motorsport-Enthusiast und Podcaster aus Leidenschaft. Verfolgt die Formel 1 seit den 90ern.', 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/0b4d4559-4592-4217-91a0-5e36746f3d9b/sg_boldpredictions_2024.png', 'https://twitter.com', 'https://instagram.com'),
                ('Dennis Lewandowski', 'Experte für Technik und Strategie in der Formel 1. Analysiert jedes Rennen bis ins kleinste Detail.', 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/0b4d4559-4592-4217-91a0-5e36746f3d9b/sg_fahrerranking_2025.png', 'https://twitter.com', 'https://instagram.com')
             ");

             $platforms = [
                ['Spotify', 'https://open.spotify.com/show/248DTJayGh73lX1bXAhBRa?si=JpNmmoDvQva6lram6n0cqw&dl_branch=1', 'spotify', 1],
                ['Apple Podcasts', 'https://itunes.apple.com/de/podcast/starting-grid/id1058868792?mt=2', 'apple', 2],
                ['YouTube', 'https://www.youtube.com/@startinggrid_f1', 'youtube', 3],
                ['RTL+', 'https://plus.rtl.de/podcast/starting-grid-l0j19z3kz1247', 'rtl', 4],
                ['Deezer', 'https://deezer.com/show/1006282', 'deezer', 5],
                ['meinsportpodcast.de', 'https://meinsportpodcast.de/motorsport/starting-grid/', 'rss', 6]
             ];

             $stmt = $pdo->prepare("INSERT INTO platforms (name, url, icon_name, display_order) VALUES (?, ?, ?, ?)");
             foreach ($platforms as $p) {
                 $stmt->execute($p);
             }
        }
    } catch (PDOException $e) {
        // Silently ignore if already initializing or tables exist but schema diff
    }
}

ensureDatabaseInitialized($pdo);

try {
    switch (true) {
        // --- Podcast Info ---
        case ($endpoint === 'podcast' && $method === 'GET'):
            $stmt = $pdo->query("SELECT * FROM podcast_info WHERE id = 1");
            echo json_encode($stmt->fetch() ?: (object)[]);
            break;

        case ($endpoint === 'podcast' && $method === 'PUT'):
            $stmt = $pdo->prepare("
                UPDATE podcast_info
                SET title = ?, description = ?, cover_image = ?, logo_image = ?, about_text = ?, about_image = ?, seo_title = ?, seo_description = ?, seo_keywords = ?, favicon_image = ?, social_image = ?
                WHERE id = 1
            ");
            $stmt->execute([
                $inputData['title'] ?? '',
                $inputData['description'] ?? '',
                $inputData['cover_image'] ?? '',
                $inputData['logo_image'] ?? '',
                $inputData['about_text'] ?? '',
                $inputData['about_image'] ?? '',
                $inputData['seo_title'] ?? '',
                $inputData['seo_description'] ?? '',
                $inputData['seo_keywords'] ?? '',
                $inputData['favicon_image'] ?? '',
                $inputData['social_image'] ?? ''
            ]);
            echo json_encode(["success" => true]);
            break;

        // --- Hosts ---
        case ($endpoint === 'hosts' && $method === 'GET'):
            $stmt = $pdo->query("SELECT * FROM hosts");
            echo json_encode($stmt->fetchAll());
            break;

        case (($id = getPathParam($endpoint, 'hosts')) && $method === 'PUT'):
            $stmt = $pdo->prepare("
                UPDATE hosts SET name = ?, bio = ?, image_url = ?, twitter_url = ?, instagram_url = ?, email = ? WHERE id = ?
            ");
            $stmt->execute([
                $inputData['name'] ?? '',
                $inputData['bio'] ?? '',
                $inputData['image_url'] ?? '',
                $inputData['twitter_url'] ?? '',
                $inputData['instagram_url'] ?? '',
                $inputData['email'] ?? '',
                $id
            ]);
            echo json_encode(["success" => true]);
            break;

        // --- Episodes ---
        case ($endpoint === 'episodes' && $method === 'GET'):
            $stmt = $pdo->query("
                SELECT id, title, description, audio_url, DATE_FORMAT(published_at, '%Y-%m-%d') as published_at, is_hero, duration, image_url
                FROM episodes
                ORDER BY published_at DESC
            ");
            echo json_encode($stmt->fetchAll());
            break;

        case ($endpoint === 'episodes' && $method === 'POST'):
            if (!empty($inputData['is_hero'])) {
                $pdo->exec("UPDATE episodes SET is_hero = 0");
            }
            $dateStr = !empty($inputData['published_at']) ? explode('T', $inputData['published_at'])[0] : null;
            $stmt = $pdo->prepare("
                INSERT INTO episodes (title, description, audio_url, published_at, is_hero, image_url, duration)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $inputData['title'] ?? '',
                $inputData['description'] ?? '',
                $inputData['audio_url'] ?? '',
                $dateStr,
                !empty($inputData['is_hero']) ? 1 : 0,
                $inputData['image_url'] ?? '',
                $inputData['duration'] ?? ''
            ]);
            echo json_encode(["id" => $pdo->lastInsertId()]);
            break;

        case (($id = getPathParam($endpoint, 'episodes')) && $method === 'PUT'):
            if (!empty($inputData['is_hero'])) {
                $pdo->exec("UPDATE episodes SET is_hero = 0");
            }
            $dateStr = !empty($inputData['published_at']) ? explode('T', $inputData['published_at'])[0] : null;
            $stmt = $pdo->prepare("
                UPDATE episodes
                SET title = ?, description = ?, audio_url = ?, published_at = ?, is_hero = ?, image_url = ?, duration = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $inputData['title'] ?? '',
                $inputData['description'] ?? '',
                $inputData['audio_url'] ?? '',
                $dateStr,
                !empty($inputData['is_hero']) ? 1 : 0,
                $inputData['image_url'] ?? '',
                $inputData['duration'] ?? '',
                $id
            ]);
            echo json_encode(["success" => true]);
            break;

        case (($id = getPathParam($endpoint, 'episodes')) && $method === 'DELETE'):
            $stmt = $pdo->prepare("DELETE FROM episodes WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["success" => true]);
            break;

        case ($endpoint === 'admin/episodes/clear' && $method === 'DELETE'):
            $pdo->exec("DELETE FROM episodes");
            $pdo->exec("ALTER TABLE episodes AUTO_INCREMENT = 1");
            echo json_encode(["success" => true]);
            break;

        // --- RSS Import ---
        case ($endpoint === 'admin/rss-import' && $method === 'POST'):
            $rssUrl = 'https://meinsportpodcast.de/motorsport/starting-grid/feed/';

            // Allow suppressing warnings during XML fetch to catch errors manually
            $xmlString = @file_get_contents($rssUrl);
            if ($xmlString === false) {
                 throw new Exception("Fehler beim Abrufen des RSS-Feeds.");
            }

            $xml = @simplexml_load_string($xmlString, 'SimpleXMLElement', LIBXML_NOCDATA);
            if ($xml === false) {
                 throw new Exception("Fehler beim Parsen des RSS-Feeds.");
            }

            // Register namespaces to parse iTunes tags
            $namespaces = $xml->getNamespaces(true);

            $importedCount = 0;
            $stmtCheck = $pdo->prepare("SELECT id, duration FROM episodes WHERE guid = ?");

            foreach ($xml->channel->item as $item) {
                $title = (string)$item->title;
                $guid = (string)$item->guid;
                if (!$title || !$guid) continue;

                $duration = "";
                if (isset($namespaces['itunes'])) {
                    $itunes = $item->children($namespaces['itunes']);
                    if (isset($itunes->duration)) {
                        $duration = (string)$itunes->duration;
                    }
                }

                $description = "";
                if (isset($namespaces['content'])) {
                    $content = $item->children($namespaces['content']);
                    if (isset($content->encoded)) {
                         $description = trim((string)$content->encoded);
                    }
                }
                if (empty($description)) {
                     $description = trim((string)$item->description);
                }

                $audioUrl = "#";
                if (isset($item->enclosure)) {
                    $audioUrl = (string)$item->enclosure['url'];
                } elseif (isset($item->link)) {
                    $audioUrl = (string)$item->link;
                }

                $pubDate = (string)$item->pubDate;
                $dateObj = $pubDate ? new DateTime($pubDate) : new DateTime();
                $dateStr = $dateObj->format('Y-m-d');

                $stmtCheck->execute([$guid]);
                $existing = $stmtCheck->fetch();

                if (!$existing) {
                    $stmtIns = $pdo->prepare("
                        INSERT INTO episodes (title, description, audio_url, published_at, is_hero, guid, duration)
                        VALUES (?, ?, ?, ?, 0, ?, ?)
                    ");
                    $stmtIns->execute([$title, $description, $audioUrl, $dateStr, $guid, $duration]);
                    $importedCount++;
                } else {
                    $stmtUpd = $pdo->prepare("
                        UPDATE episodes SET duration = ?, description = ? WHERE id = ?
                    ");
                    $stmtUpd->execute([
                        $duration ?: $existing['duration'],
                        $description,
                        $existing['id']
                    ]);
                }
            }
            echo json_encode(["success" => true, "imported" => $importedCount]);
            break;

        // --- Platforms ---
        case ($endpoint === 'platforms' && $method === 'GET'):
            $stmt = $pdo->query("SELECT * FROM platforms ORDER BY display_order ASC");
            echo json_encode($stmt->fetchAll());
            break;

        case ($endpoint === 'platforms' && $method === 'POST'):
            $stmt = $pdo->prepare("
                INSERT INTO platforms (name, url, icon_name, display_order) VALUES (?, ?, 'rss', ?)
            ");
            $stmt->execute([
                $inputData['name'] ?? '',
                $inputData['url'] ?? '',
                $inputData['display_order'] ?? 0
            ]);
            echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
            break;

        case (($id = getPathParam($endpoint, 'platforms')) && $method === 'PUT'):
            $stmt = $pdo->prepare("
                UPDATE platforms SET name = ?, url = ?, icon_url = ?, display_order = ? WHERE id = ?
            ");
            $stmt->execute([
                $inputData['name'] ?? '',
                $inputData['url'] ?? '',
                $inputData['icon_url'] ?? '',
                $inputData['display_order'] ?? 0,
                $id
            ]);
            echo json_encode(["success" => true]);
            break;

        case (($id = getPathParam($endpoint, 'platforms')) && $method === 'DELETE'):
            $stmt = $pdo->prepare("DELETE FROM platforms WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["success" => true]);
            break;

        case (preg_match('@^platforms/([^/]+)/icon$@', $endpoint, $matches) && $method === 'POST'):
            $id = $matches[1];
            if (!isset($_FILES['icon'])) {
                http_response_code(400);
                echo json_encode(["error" => "No file uploaded"]);
                exit;
            }

            $uploadResult = handleUpload($_FILES['icon']);
            if ($uploadResult['success']) {
                $iconUrl = $uploadResult['url'];
                $stmt = $pdo->prepare("UPDATE platforms SET icon_url = ? WHERE id = ?");
                $stmt->execute([$iconUrl, $id]);
                echo json_encode(["success" => true, "icon_url" => $iconUrl]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => $uploadResult['error']]);
            }
            break;

        // --- Uploads ---
        case ($endpoint === 'upload' && $method === 'POST'):
            if (!isset($_FILES['image'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Keine Datei gesendet."]);
                exit;
            }

            $uploadResult = handleUpload($_FILES['image']);
            if ($uploadResult['success']) {
                echo json_encode(["success" => true, "url" => $uploadResult['url']]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "error" => $uploadResult['error']]);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(["error" => "Endpoint not found"]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Internal Server Error", "details" => $e->getMessage()]);
}

?>