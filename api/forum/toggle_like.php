<?php
require_once '../config.php';
header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if(!isset($data['user_id']) || !isset($data['entity_id']) || !isset($data['entity_type'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing fields"]);
        exit;
    }
    
    $user_id = $data['user_id'];
    $entity_id = $data['entity_id'];
    $entity_type = $data['entity_type']; // 'thread' or 'reply'
    
    $pdo->beginTransaction();
    
    // Check if like exists
    $checkStmt = $pdo->prepare("SELECT 1 FROM forum_likes WHERE user_id = ? AND entity_id = ? AND entity_type = ?");
    $checkStmt->execute([$user_id, $entity_id, $entity_type]);
    $exists = $checkStmt->fetchColumn();
    
    $table = $entity_type === 'thread' ? 'forum_threads' : 'forum_replies';
    
    if ($exists) {
        // Unlike
        $delStmt = $pdo->prepare("DELETE FROM forum_likes WHERE user_id = ? AND entity_id = ? AND entity_type = ?");
        $delStmt->execute([$user_id, $entity_id, $entity_type]);
        
        $updateStmt = $pdo->prepare("UPDATE $table SET likes_count = likes_count - 1 WHERE id = ?");
        $updateStmt->execute([$entity_id]);
        $action = 'unliked';
    } else {
        // Like
        $insStmt = $pdo->prepare("INSERT INTO forum_likes (user_id, entity_id, entity_type) VALUES (?, ?, ?)");
        $insStmt->execute([$user_id, $entity_id, $entity_type]);
        
        $updateStmt = $pdo->prepare("UPDATE $table SET likes_count = likes_count + 1 WHERE id = ?");
        $updateStmt->execute([$entity_id]);
        $action = 'liked';
    }
    
    $pdo->commit();
    echo json_encode(["success" => true, "action" => $action]);
    
} catch (Exception $e) {
    if($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
