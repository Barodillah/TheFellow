<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!$pdo) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) $data = $_POST;

$id = $data['id'] ?? null;
$is_active = isset($data['is_active']) ? (int)$data['is_active'] : 0;

if (!$id) {
    echo json_encode(['status' => 'error', 'message' => 'ID is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE events SET is_active = ? WHERE id = ?");
    $stmt->execute([$is_active, $id]);
    echo json_encode(['status' => 'success', 'message' => 'Event status toggled']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
