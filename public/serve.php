<?php
// Fallback content from index.html
$html = file_get_contents('index.html');
$requestUri = $_SERVER['REQUEST_URI'];
$slug = '';

// Ekstrak slug jika URL adalah /articles/slug-artikel
if (preg_match('#^/articles/([^/?]+)#', $requestUri, $matches)) {
    $slug = $matches[1];
}

// Jika ini halaman artikel, ambil meta datanya dari database
if ($slug) {
    // Sesuaikan path ke config.php berdasarkan lokasi deploy (production vs dev)
    $configPath = 'api/config.php';
    if (!file_exists($configPath)) {
        $configPath = '../api/config.php';
    }
    
    if (file_exists($configPath)) {
        require_once $configPath;
        if (isset($pdo)) {
            $stmt = $pdo->prepare("SELECT title, excerpt, cover_image FROM articles WHERE slug = ?");
            $stmt->execute([$slug]);
            $article = $stmt->fetch();
            
            if ($article) {
                // Siapkan data sanitasi
                $title = htmlspecialchars($article['title']);
                $desc = htmlspecialchars(strip_tags($article['excerpt']));
                
                // Siapkan URL gambar dengan domain absolut jika memungkinkan (penting untuk OG tags)
                $image = $article['cover_image'];
                if (!$image) {
                    $image = 'https://incsmsociety.site/preview.png';
                } else if (strpos($image, 'http') !== 0) {
                    $image = 'https://incsmsociety.site' . (strpos($image, '/') === 0 ? '' : '/') . $image;
                }
                
                // Replace title
                $html = preg_replace('/<title>.*?<\/title>/is', "<title>$title | The Fellow</title>", $html);
                
                $html = preg_replace('/<meta name="title" content="[^"]*"/i', '<meta name="title" content="'.$title.' | The Fellow"', $html);
                $html = preg_replace('/<meta property="og:title" content="[^"]*"/i', '<meta property="og:title" content="'.$title.' | The Fellow"', $html);
                $html = preg_replace('/<meta property="twitter:title" content="[^"]*"/i', '<meta property="twitter:title" content="'.$title.' | The Fellow"', $html);
                
                // Replace description (using \s* to handle newlines if not minified)
                $html = preg_replace('/<meta name="description"\s*content="[^"]*"/is', '<meta name="description" content="'.$desc.'"', $html);
                $html = preg_replace('/<meta property="og:description"\s*content="[^"]*"/is', '<meta property="og:description" content="'.$desc.'"', $html);
                $html = preg_replace('/<meta property="twitter:description"\s*content="[^"]*"/is', '<meta property="twitter:description" content="'.$desc.'"', $html);
                
                // Replace image
                $html = preg_replace('/<meta property="og:image" content="[^"]*"/i', '<meta property="og:image" content="'.$image.'"', $html);
                $html = preg_replace('/<meta property="twitter:image" content="[^"]*"/i', '<meta property="twitter:image" content="'.$image.'"', $html);
            }
        }
    }
}

// Output HTML yang sudah di-inject (atau HTML asli jika bukan artikel)
echo $html;
