<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

$article_id = $data['id'] ?? null;
$author_id = $data['author_id'] ?? null;
$title = $data['title'] ?? null;
$category = $data['category'] ?? null;
$excerpt = $data['excerpt'] ?? null;
$content = $data['content'] ?? null;
$cover_image = $data['cover_image'] ?? null;
$status = $data['status'] ?? 'draft'; 
$tags = $data['tags'] ?? [];
$references = $data['references'] ?? [];

if (!$article_id || !$author_id || !$title || !$content) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

function generateSlug($title, $pdo, $exclude_id = null) {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
    $original_slug = $slug;
    $count = 1;
    while (true) {
        if ($exclude_id) {
            $stmt = $pdo->prepare("SELECT id FROM articles WHERE slug = ? AND id != ?");
            $stmt->execute([$slug, $exclude_id]);
        } else {
            $stmt = $pdo->prepare("SELECT id FROM articles WHERE slug = ?");
            $stmt->execute([$slug]);
        }
        if (!$stmt->fetch()) {
            break;
        }
        $slug = $original_slug . '-' . $count;
        $count++;
    }
    return $slug;
}

try {
    $pdo->beginTransaction();

    // 0. Fetch existing article to check status and current slug
    $stmt_check_article = $pdo->prepare("SELECT status, slug FROM articles WHERE id = ?");
    $stmt_check_article->execute([$article_id]);
    $existing_article = $stmt_check_article->fetch();

    if (!$existing_article) {
        throw new Exception("Article not found");
    }

    $current_db_status = $existing_article['status'];
    $final_slug = $existing_article['slug'];

    // If it was a draft, allow changing the slug based on the new title
    if ($current_db_status === 'draft') {
        $final_slug = generateSlug($title, $pdo, $article_id);
    }

    // 1. Update Article
    $stmt = $pdo->prepare("UPDATE articles SET title=?, slug=?, category=?, excerpt=?, content=?, cover_image=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?");
    $stmt->execute([$title, $final_slug, $category, $excerpt, $content, $cover_image, $status, $article_id]);

    // 2. Update Tags (Delete and Re-insert)
    $stmt_del_tags = $pdo->prepare("DELETE FROM article_tags WHERE article_id = ?");
    $stmt_del_tags->execute([$article_id]);
    
    if (!empty($tags)) {
        $stmt_tag = $pdo->prepare("INSERT INTO article_tags (article_id, tag_name) VALUES (?, ?)");
        foreach ($tags as $tag) {
            $stmt_tag->execute([$article_id, $tag]);
        }
    }

    // 3. Update References (Delete and Re-insert)
    $stmt_del_ref = $pdo->prepare("DELETE FROM article_references WHERE article_id = ?");
    $stmt_del_ref->execute([$article_id]);
    
    if (!empty($references)) {
        $stmt_ref = $pdo->prepare("INSERT INTO article_references (article_id, url, title) VALUES (?, ?, ?)");
        foreach ($references as $ref) {
            $stmt_ref->execute([$article_id, $ref['url'], $ref['title']]);
        }
    }

    // 4. Handle Forum Link if status is 'published'
    if ($status === 'published') {
        $stmt_check = $pdo->prepare("SELECT * FROM article_forum_links WHERE article_id = ?");
        $stmt_check->execute([$article_id]);
        $existing_link = $stmt_check->fetch();

        if (!$existing_link) {
            // Generate UUID for thread
            $thread_id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );

            $forum_content = "Artikel Baru: **" . $title . "**\n\n" . $excerpt . "\n\n[Baca Artikel Selengkapnya](/articles/" . $final_slug . ")";

            $stmt_thread = $pdo->prepare("INSERT INTO forum_threads (id, author_id, category, title, content) VALUES (?, ?, ?, ?, ?)");
            $stmt_thread->execute([$thread_id, $author_id, 'Artikel', $title, $forum_content]);

            $stmt_link = $pdo->prepare("INSERT INTO article_forum_links (article_id, thread_id, is_visible_in_forum) VALUES (?, ?, ?)");
            $stmt_link->execute([$article_id, $thread_id, 0]); 
        } else {
             // Optionally update the forum thread title/content
             $forum_content = "Artikel Diperbarui: **" . $title . "**\n\n" . $excerpt . "\n\n[Baca Artikel Selengkapnya](/articles/" . $final_slug . ")";
             $stmt_thread_update = $pdo->prepare("UPDATE forum_threads SET title=?, content=? WHERE id=?");
             $stmt_thread_update->execute([$title, $forum_content, $existing_link['thread_id']]);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Article updated successfully']);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
