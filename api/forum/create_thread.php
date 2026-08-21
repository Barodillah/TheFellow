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
    
    if(!isset($data['author_id']) || !isset($data['title']) || !isset($data['content']) || !isset($data['category'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }
    
    $id = generate_uuid();
    $link_metadata = null;
    if (isset($data['link_metadata']) && !empty($data['link_metadata'])) {
        // If frontend passes rich metadata
        $link_metadata = $data['link_metadata'];
        if (is_array($link_metadata)) {
            $link_metadata = json_encode($link_metadata);
        }
    } elseif (isset($data['link']) && !empty($data['link'])) {
        // Fallback
        $link_metadata = json_encode(["url" => $data['link']]);
    }
    $stmt = $pdo->prepare("INSERT INTO forum_threads (id, author_id, category, title, content, link_metadata) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id,
        $data['author_id'],
        $data['category'],
        $data['title'],
        $data['content'],
        $link_metadata
    ]);
    
    echo json_encode(["success" => true, "message" => "Thread created", "id" => $id]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
