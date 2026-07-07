<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? '';
$user_id = $data['user_id'] ?? '';
$year = $data['year'] ?? '';
$title = $data['title'] ?? '';
$competition = $data['competition'] ?? '';
$description = $data['description'] ?? '';

if (empty($id) || empty($user_id) || empty($year) || empty($title)) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap.']);
    exit();
}

try {
    $sql = "UPDATE user_achievements SET year = ?, title = ?, competition = ?, description = ? WHERE id = ? AND user_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$year, $title, $competition, $description, $id, $user_id]);
    
    // We don't check rowCount > 0 as success criteria because saving without changing any fields will result in rowCount = 0.
    echo json_encode(['status' => 'success', 'message' => 'Prestasi berhasil diperbarui.']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
