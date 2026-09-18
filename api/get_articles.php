<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$user_id = $_GET['user_id'] ?? null;
$role = $_GET['role'] ?? 'member'; // admin or member

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User ID is required']);
    exit;
}

try {
    if ($role === 'admin') {
        // Admin can see all articles (useful for admin dashboard)
        $stmt = $pdo->prepare("
            SELECT a.*, u.name as author_name, u.avatar as author_avatar
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            ORDER BY a.created_at DESC
        ");
        $stmt->execute();
    } else {
        // Normal user only sees their own articles
        $stmt = $pdo->prepare("
            SELECT a.*, u.name as author_name, u.avatar as author_avatar
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.author_id = ?
            ORDER BY a.created_at DESC
        ");
        $stmt->execute([$user_id]);
    }

    $articles = $stmt->fetchAll();

    // Fetch tags for each article
    foreach ($articles as &$article) {
        $stmt_tags = $pdo->prepare("SELECT tag_name FROM article_tags WHERE article_id = ?");
        $stmt_tags->execute([$article['id']]);
        $article['tags'] = $stmt_tags->fetchAll(PDO::FETCH_COLUMN);
    }

    echo json_encode(['success' => true, 'data' => $articles]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
