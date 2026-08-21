<?php
require_once '../config.php';
header('Content-Type: application/json');

try {
    if(!isset($_GET['thread_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing thread_id"]);
        exit;
    }
    
    $thread_id = $_GET['thread_id'];
    
    $stmt = $pdo->prepare("
        SELECT r.*, u.name as author_name, u.avatar as author_avatar 
        FROM forum_replies r 
        JOIN users u ON r.author_id = u.id 
        WHERE r.thread_id = ? 
        ORDER BY r.created_at ASC
    ");
    $stmt->execute([$thread_id]);
    $replies = $stmt->fetchAll();
    
    echo json_encode(["success" => true, "data" => $replies]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
