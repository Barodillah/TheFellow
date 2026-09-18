<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("
        SELECT a.id, a.slug, a.title, a.category, a.excerpt, a.cover_image, a.created_at, u.name as author_name
        FROM articles a
        LEFT JOIN users u ON a.author_id = u.id
        WHERE a.status = 'published'
        ORDER BY a.created_at DESC
    ");
    $stmt->execute();
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $articles]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
