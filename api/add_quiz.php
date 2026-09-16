<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->title) || !isset($data->deadline) || !isset($data->questions) || !is_array($data->questions)) {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap. Judul, deadline, dan daftar soal (minimal 1) wajib diisi.']);
    exit;
}

$title = $data->title;
$description = isset($data->description) ? $data->description : '';
$deadline = $data->deadline;
$status = isset($data->status) ? $data->status : 'active';
$questions = $data->questions;

if (empty($questions)) {
    echo json_encode(['success' => false, 'message' => 'Kuis harus memiliki minimal 1 soal.']);
    exit;
}

if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Koneksi database gagal.']);
    exit;
}

try {
    // Memulai transaksi
    $pdo->beginTransaction();

    // 1. Insert ke tabel quizzes
    $stmtQuiz = $pdo->prepare("INSERT INTO quizzes (title, description, deadline, status) VALUES (:title, :description, :deadline, :status)");
    $stmtQuiz->execute([
        ':title' => $title,
        ':description' => $description,
        ':deadline' => $deadline,
        ':status' => $status
    ]);
    
    $quizId = $pdo->lastInsertId();

    // 2. Insert ke tabel quiz_questions
    $stmtQuestion = $pdo->prepare("INSERT INTO quiz_questions (quiz_id, question_text, options) VALUES (:quiz_id, :question_text, :options)");
    
    foreach ($questions as $q) {
        $qText = isset($q->q) ? $q->q : '';
        $optionsJSON = isset($q->options) ? json_encode($q->options) : json_encode([]);
        
        $stmtQuestion->execute([
            ':quiz_id' => $quizId,
            ':question_text' => $qText,
            ':options' => $optionsJSON
        ]);
    }

    // Komit transaksi
    $pdo->commit();

    echo json_encode([
        'success' => true, 
        'message' => 'Kuis berhasil disimpan.',
        'quiz_id' => $quizId
    ]);

} catch (Exception $e) {
    // Jika terjadi error, rollback transaksi agar tidak ada data yang masuk setengah
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat menyimpan kuis: ' . $e->getMessage()]);
}
?>
