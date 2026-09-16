<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require 'config.php';

$quizId = isset($_GET['quiz_id']) ? $_GET['quiz_id'] : null;

if (!$quizId) {
    echo json_encode(['success' => false, 'message' => 'Quiz ID diperlukan']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            qs.score, 
            qs.submitted_at, 
            u.name, 
            u.avatar
        FROM quiz_submissions qs
        JOIN users u ON qs.user_id = u.id
        WHERE qs.quiz_id = :quiz_id
        ORDER BY qs.score DESC, qs.submitted_at ASC
        LIMIT 10
    ");
    $stmt->execute([':quiz_id' => $quizId]);
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $leaderboard]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
?>
