<?php
require_once '../config.php';
header('Content-Type: application/json');

try {
    $category = isset($_GET['category']) ? $_GET['category'] : 'all';
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    
    $query = "SELECT t.*, u.name as author_name, u.avatar as author_avatar 
              FROM forum_threads t 
              JOIN users u ON t.author_id = u.id ";
              
    $params = [];
    if ($category !== 'all') {
        $query .= "WHERE t.category = ? ";
        $params[] = $category;
    }
    
    $query .= "ORDER BY t.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $threads = $stmt->fetchAll();
    
    foreach($threads as &$t) {
        $t['is_liked_by_me'] = false;
        if ($user_id) {
            $likeStmt = $pdo->prepare("SELECT 1 FROM forum_likes WHERE user_id = ? AND entity_id = ? AND entity_type = 'thread'");
            $likeStmt->execute([$user_id, $t['id']]);
            if ($likeStmt->fetch()) {
                $t['is_liked_by_me'] = true;
            }
        }
        if(!empty($t['link_metadata'])) {
            $t['link_metadata'] = json_decode($t['link_metadata'], true);
        }
    }
    
    echo json_encode(["success" => true, "data" => $threads]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
