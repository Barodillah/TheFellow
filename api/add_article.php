<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

$author_id = $data['author_id'] ?? null;
$title = $data['title'] ?? null;
$category = $data['category'] ?? null;
$excerpt = $data['excerpt'] ?? null;
$content = $data['content'] ?? null;
$cover_image = $data['cover_image'] ?? null;
$status = $data['status'] ?? 'draft'; // draft, request, published
$tags = $data['tags'] ?? [];
$references = $data['references'] ?? [];

if (!$author_id || !$title || !$content) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

function generateSlug($title, $pdo) {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
    $original_slug = $slug;
    $count = 1;
    while (true) {
        $stmt = $pdo->prepare("SELECT id FROM articles WHERE slug = ?");
        $stmt->execute([$slug]);
        if (!$stmt->fetch()) {
            break;
        }
        $slug = $original_slug . '-' . $count;
        $count++;
    }
    return $slug;
}

$slug = generateSlug($title, $pdo);

// Generate UUID for article
$article_id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);

try {
    $pdo->beginTransaction();

    // 1. Insert Article
    $stmt = $pdo->prepare("INSERT INTO articles (id, author_id, title, slug, category, excerpt, content, cover_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$article_id, $author_id, $title, $slug, $category, $excerpt, $content, $cover_image, $status]);

    // 2. Insert Tags
    if (!empty($tags)) {
        $stmt_tag = $pdo->prepare("INSERT INTO article_tags (article_id, tag_name) VALUES (?, ?)");
        foreach ($tags as $tag) {
            $stmt_tag->execute([$article_id, $tag]);
        }
    }

    // 3. Insert References
    if (!empty($references)) {
        $stmt_ref = $pdo->prepare("INSERT INTO article_references (article_id, url, title) VALUES (?, ?, ?)");
        foreach ($references as $ref) {
            $stmt_ref->execute([$article_id, $ref['url'], $ref['title']]);
        }
    }

    // 4. Handle Forum Link if status is 'published'
    if ($status === 'published') {
        // Generate UUID for thread
        $thread_id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $forum_content = "Artikel Baru: **" . $title . "**\n\n" . $excerpt . "\n\n[Baca Artikel Selengkapnya](/articles/" . $slug . ")";

        $stmt_thread = $pdo->prepare("INSERT INTO forum_threads (id, author_id, category, title, content) VALUES (?, ?, ?, ?, ?)");
        $stmt_thread->execute([$thread_id, $author_id, 'Artikel', $title, $forum_content]);

        $stmt_link = $pdo->prepare("INSERT INTO article_forum_links (article_id, thread_id, is_visible_in_forum) VALUES (?, ?, ?)");
        $stmt_link->execute([$article_id, $thread_id, 0]); // Default false until commented
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Article saved successfully', 'article_id' => $article_id]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
