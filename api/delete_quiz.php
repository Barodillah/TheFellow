<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->id)) {
    echo json_encode(['success' => false, 'message' => 'ID kuis wajib disertakan.']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM quizzes WHERE id = :id");
    $stmt->execute([':id' => $data->id]);

    echo json_encode(['success' => true, 'message' => 'Kuis berhasil dihapus.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Gagal menghapus kuis: ' . $e->getMessage()]);
}
?>
