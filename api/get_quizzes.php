<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Koneksi database gagal.']);
    exit;
}

$userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

try {
    // Auto expire kuis (waktu di DB dalam UTC)
    $pdo->query("UPDATE quizzes SET status = 'expired' WHERE status = 'active' AND deadline < UTC_TIMESTAMP()");

    // 1. Ambil kuis yang active dan expired
    $stmt = $pdo->prepare("SELECT * FROM quizzes WHERE status IN ('active', 'expired') ORDER BY created_at DESC");
    $stmt->execute();
    $quizzes = $stmt->fetchAll();

    // 2. Ambil soal untuk setiap kuis dan status submission jika user_id disertakan
    foreach ($quizzes as &$quiz) {
        // Ambil Soal
        $qStmt = $pdo->prepare("SELECT * FROM quiz_questions WHERE quiz_id = :quiz_id");
        $qStmt->execute([':quiz_id' => $quiz['id']]);
        $questions = $qStmt->fetchAll();
        
        // Decode JSON options
        foreach ($questions as &$q) {
            $q['options'] = json_decode($q['options'], true);
        }
        
        $quiz['questions'] = $questions;

        // Ambil Status Pengerjaan User (jika ada user_id)
        $quiz['isCompleted'] = false;
        $quiz['userScore'] = 0;
        
        $quiz['submitted_at'] = null;
        
        if ($userId) {
            $subStmt = $pdo->prepare("SELECT score, answers, submitted_at FROM quiz_submissions WHERE quiz_id = :quiz_id AND user_id = :user_id LIMIT 1");
            $subStmt->execute([':quiz_id' => $quiz['id'], ':user_id' => $userId]);
            $submission = $subStmt->fetch();
            
            if ($submission) {
                $quiz['isCompleted'] = true;
                $quiz['userScore'] = $submission['score'];
                $quiz['submitted_at'] = $submission['submitted_at'];
                $quiz['userAnswers'] = json_decode($submission['answers'], true);
            }
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $quizzes
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
?>
