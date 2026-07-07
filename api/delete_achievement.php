<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? '';
$user_id = $data['user_id'] ?? '';

if (empty($id) || empty($user_id)) {
    echo json_encode(['status' => 'error', 'message' => 'ID Prestasi dan User ID diperlukan.']);
    exit();
}

try {
    // Verifikasi kepemilikan sebelum menghapus
    $stmt = $pdo->prepare("DELETE FROM user_achievements WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Prestasi berhasil dihapus.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menghapus atau Anda tidak memiliki akses.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
