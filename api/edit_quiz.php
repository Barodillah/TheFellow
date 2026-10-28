<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->id)) {
    echo json_encode(['success' => false, 'message' => 'ID Kuis wajib diisi.']);
    exit;
}

$id = $data->id;

try {
    $stmt = $pdo->prepare("SELECT * FROM quizzes WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $quiz = $stmt->fetch();
    
    if (!$quiz) {
        echo json_encode(['success' => false, 'message' => 'Kuis tidak ditemukan.']);
        exit;
    }

    $title = isset($data->title) ? $data->title : $quiz['title'];
    $description = isset($data->description) ? $data->description : $quiz['description'];
    $deadline = isset($data->deadline) ? $data->deadline : $quiz['deadline'];
    $status = isset($data->status) ? $data->status : $quiz['status'];

    $updateStmt = $pdo->prepare("UPDATE quizzes SET title = :title, description = :description, deadline = :deadline, status = :status WHERE id = :id");
    $updateStmt->execute([
        ':title' => $title,
        ':description' => $description,
        ':deadline' => $deadline,
        ':status' => $status,
        ':id' => $id
    ]);

    echo json_encode(['success' => true, 'message' => 'Kuis berhasil diperbarui.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Gagal memperbarui kuis: ' . $e->getMessage()]);
}
?>
