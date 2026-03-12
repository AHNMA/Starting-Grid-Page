<?php
$file = 'public/api.php';
$content = file_get_contents($file);

$search = <<<EOD
            \$importedCount = 0;
            \$stmtCheck = \$pdo->prepare("SELECT id, duration FROM episodes WHERE guid = ?");

            foreach (\$xml->channel->item as \$item) {
EOD;

$replace = <<<EOD
            \$importedCount = 0;
            \$stmtCheck = \$pdo->prepare("SELECT id, duration FROM episodes WHERE guid = ?");
            \$limit = isset(\$_GET['limit']) ? (int)\$_GET['limit'] : 0;
            \$currentIndex = 0;

            foreach (\$xml->channel->item as \$item) {
                if (\$limit > 0 && \$currentIndex >= \$limit) {
                    break;
                }
                \$currentIndex++;
EOD;

$newContent = str_replace($search, $replace, $content);

if ($content === $newContent) {
    echo "Failed to replace content.\n";
} else {
    file_put_contents($file, $newContent);
    echo "Content replaced successfully.\n";
}
