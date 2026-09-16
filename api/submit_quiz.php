<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->quiz_id) || !isset($data->user_id) || !isset($data->score) || !isset($data->answers)) {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
    exit;
}

if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Koneksi database gagal.']);
    exit;
}

try {
    // Check if user already submitted
    $checkStmt = $pdo->prepare("SELECT id FROM quiz_submissions WHERE quiz_id = :quiz_id AND user_id = :user_id");
    $checkStmt->execute([
        ':quiz_id' => $data->quiz_id,
        ':user_id' => $data->user_id
    ]);

    if ($checkStmt->fetch()) {
        $updateStmt = $pdo->prepare("UPDATE quiz_submissions SET score = :score, answers = :answers, submitted_at = CURRENT_TIMESTAMP WHERE quiz_id = :quiz_id AND user_id = :user_id");
        $updateStmt->execute([
            ':quiz_id' => $data->quiz_id,
            ':user_id' => $data->user_id,
            ':score' => $data->score,
            ':answers' => json_encode($data->answers)
        ]);
        echo json_encode(['success' => true, 'message' => 'Hasil kuis berhasil diperbarui.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO quiz_submissions (quiz_id, user_id, score, answers) VALUES (:quiz_id, :user_id, :score, :answers)");
    $stmt->execute([
        ':quiz_id' => $data->quiz_id,
        ':user_id' => $data->user_id,
        ':score' => $data->score,
        ':answers' => json_encode($data->answers)
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Hasil kuis berhasil disimpan.'
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
?>
