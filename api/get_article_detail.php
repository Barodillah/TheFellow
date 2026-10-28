<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$id = $_GET['id'] ?? null;
$slug = $_GET['slug'] ?? null;
$user_id = $_GET['user_id'] ?? null;

if (!$id && !$slug) {
    echo json_encode(['success' => false, 'message' => 'Article ID or Slug is required']);
    exit;
}

try {
    if ($slug) {
        $stmt = $pdo->prepare("
            SELECT a.*, u.name as author_name, u.avatar as author_avatar
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.slug = ?
        ");
        $stmt->execute([$slug]);
    } else {
        $stmt = $pdo->prepare("
            SELECT a.*, u.name as author_name, u.avatar as author_avatar
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.id = ?
        ");
        $stmt->execute([$id]);
    }
    $article = $stmt->fetch();

    if (!$article) {
        echo json_encode(['success' => false, 'message' => 'Article not found']);
        exit;
    }

    $actual_id = $article['id'];

    // Fetch tags
    $stmt_tags = $pdo->prepare("SELECT tag_name FROM article_tags WHERE article_id = ?");
    $stmt_tags->execute([$actual_id]);
    $article['tags'] = $stmt_tags->fetchAll(PDO::FETCH_COLUMN);

    // Fetch references
    $stmt_ref = $pdo->prepare("SELECT url, title FROM article_references WHERE article_id = ?");
    $stmt_ref->execute([$actual_id]);
    $article['references'] = $stmt_ref->fetchAll();

    // Increment views (Only if fetched by slug (public view))
    if ($slug) {
        $stmt_views = $pdo->prepare("UPDATE articles SET views_count = views_count + 1 WHERE id = ?");
        $stmt_views->execute([$actual_id]);
        $article['views_count'] = (int)$article['views_count'] + 1;
    }

    // Fetch forum thread link
    $stmt_thread = $pdo->prepare("SELECT thread_id, likes_count FROM article_forum_links JOIN forum_threads ON forum_threads.id = article_forum_links.thread_id WHERE article_id = ?");
    $stmt_thread->execute([$actual_id]);
    $thread = $stmt_thread->fetch();
    
    if ($thread) {
        $article['forum_thread_id'] = $thread['thread_id'];
        $article['likes_count'] = (int)$thread['likes_count'];
        
        // Count replies
        $stmt_replies = $pdo->prepare("SELECT COUNT(*) FROM forum_replies WHERE thread_id = ?");
        $stmt_replies->execute([$thread['thread_id']]);
        $article['comments_count'] = (int)$stmt_replies->fetchColumn();

        // Check if liked by current user
        if ($user_id) {
            $stmt_like = $pdo->prepare("SELECT 1 FROM forum_likes WHERE user_id = ? AND entity_id = ? AND entity_type = 'thread'");
            $stmt_like->execute([$user_id, $thread['thread_id']]);
            $article['is_liked'] = (bool)$stmt_like->fetchColumn();
        } else {
            $article['is_liked'] = false;
        }
    } else {
        $article['forum_thread_id'] = null;
        $article['comments_count'] = 0;
        $article['likes_count'] = 0;
        $article['is_liked'] = false;
    }

    echo json_encode(['success' => true, 'data' => $article]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
