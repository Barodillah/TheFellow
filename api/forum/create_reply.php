<?php
require_once '../config.php';
header('Content-Type: application/json');

function generate_uuid() {
    return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
        mt_rand( 0, 0xffff ),
        mt_rand( 0, 0x0fff ) | 0x4000,
        mt_rand( 0, 0x3fff ) | 0x8000,
        mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
    );
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if(!isset($data['thread_id']) || !isset($data['author_id']) || !isset($data['content'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }
    
    $id = generate_uuid();
    $parent_id = isset($data['parent_id']) && !empty($data['parent_id']) ? $data['parent_id'] : null;
    
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("INSERT INTO forum_replies (id, thread_id, author_id, parent_id, content) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $id,
        $data['thread_id'],
        $data['author_id'],
        $parent_id,
        $data['content']
    ]);
    
    // Increment thread replies_count
    $updateStmt = $pdo->prepare("UPDATE forum_threads SET replies_count = replies_count + 1 WHERE id = ?");
    $updateStmt->execute([$data['thread_id']]);
    
    $pdo->commit();
    
    echo json_encode(["success" => true, "message" => "Reply created", "id" => $id]);
} catch (Exception $e) {
    if($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
