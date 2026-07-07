<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$user_id = $data['user_id'] ?? '';
$year = $data['year'] ?? '';
$title = $data['title'] ?? '';
$competition = $data['competition'] ?? '';
$description = $data['description'] ?? '';

if (empty($user_id) || empty($year) || empty($title)) {
    echo json_encode(['status' => 'error', 'message' => 'User ID, Tahun, dan Judul Prestasi harus diisi.']);
    exit();
}

try {
    $sql = "INSERT INTO user_achievements (user_id, year, title, competition, description) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id, $year, $title, $competition, $description]);
    
    echo json_encode(['status' => 'success', 'message' => 'Prestasi berhasil ditambahkan.']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
