<?php
require_once '../config.php';
header('Content-Type: application/json');

try {
    if(!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing ID"]);
        exit;
    }
    
    $id = $_GET['id'];
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    
    // Update views_count
    $updateStmt = $pdo->prepare("UPDATE forum_threads SET views_count = views_count + 1 WHERE id = ?");
    $updateStmt->execute([$id]);
    
    // Fetch thread
    $stmt = $pdo->prepare("
        SELECT t.*, u.name as author_name, u.avatar as author_avatar, u.title as author_title, u.csm_title as author_csm_title, u.bio as author_bio, u.role as author_role 
        FROM forum_threads t 
        JOIN users u ON t.author_id = u.id 
        WHERE t.id = ?
    ");
    $stmt->execute([$id]);
    $thread = $stmt->fetch();
    
    if($thread) {
        $thread['is_liked_by_me'] = false;
        if ($user_id) {
            $likeStmt = $pdo->prepare("SELECT 1 FROM forum_likes WHERE user_id = ? AND entity_id = ? AND entity_type = 'thread'");
            $likeStmt->execute([$user_id, $thread['id']]);
            if ($likeStmt->fetch()) {
                $thread['is_liked_by_me'] = true;
            }
        }
        if(!empty($thread['link_metadata'])) {
            $thread['link_metadata'] = json_decode($thread['link_metadata'], true);
        }
        echo json_encode(["success" => true, "data" => $thread]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Thread not found"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
