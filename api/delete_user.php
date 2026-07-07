<?php
require_once 'config.php';
header('Content-Type: application/json');

if (!isset($pdo) || $pdo === null) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? '';

if (empty($id)) {
    echo json_encode(['status' => 'error', 'message' => 'ID pengguna tidak valid.']);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['status' => 'success', 'message' => 'Pengguna berhasil dihapus.']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
