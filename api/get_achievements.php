<?php
require_once 'config.php';
header('Content-Type: application/json');

$user_id = $_GET['user_id'] ?? null;

try {
    if ($user_id) {
        $stmt = $pdo->prepare("SELECT * FROM user_achievements WHERE user_id = ? ORDER BY year DESC, created_at DESC");
        $stmt->execute([$user_id]);
        $achievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $stmt = $pdo->prepare("
            SELECT a.*, u.name as user_name, u.avatar as user_avatar, u.title as user_title 
            FROM user_achievements a 
            JOIN users u ON a.user_id = u.id 
            ORDER BY a.year DESC, a.created_at DESC
        ");
        $stmt->execute();
        $achievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['status' => 'success', 'achievements' => $achievements]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
