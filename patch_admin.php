<?php
$file = 'src/pages/Admin.tsx';
$content = file_get_contents($file);

$search1 = <<<EOD
  const handleImportRSS = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rss-import', { method: 'POST' });
EOD;

$replace1 = <<<EOD
  const handleImportRSS = async (limit?: number) => {
    setLoading(true);
    try {
      const url = limit ? `/api/admin/rss-import?limit=\${limit}` : '/api/admin/rss-import';
      const res = await fetch(url, { method: 'POST' });
EOD;

$search2 = <<<EOD
              <button
                onClick={handleImportRSS}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
              >
                <Rss className="w-4 h-4" /> Import RSS
              </button>
EOD;

$replace2 = <<<EOD
              <button
                onClick={() => handleImportRSS()}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
              >
                <Rss className="w-4 h-4" /> Alle (RSS)
              </button>
              <button
                onClick={() => handleImportRSS(1)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
              >
                <Rss className="w-4 h-4" /> Neueste (RSS)
              </button>
EOD;

$newContent = str_replace($search1, $replace1, $content);
$newContent = str_replace($search2, $replace2, $newContent);

if ($content === $newContent) {
    echo "Failed to replace content.\n";
} else {
    file_put_contents($file, $newContent);
    echo "Content replaced successfully.\n";
}
