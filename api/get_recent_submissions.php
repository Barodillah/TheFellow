<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require 'config.php';

try {
    $stmt = $pdo->query("
        SELECT 
            qs.score, 
            qs.submitted_at, 
            u.name, 
            u.avatar, 
            q.title as quiz_title
        FROM quiz_submissions qs
        JOIN users u ON qs.user_id = u.id
        JOIN quizzes q ON qs.quiz_id = q.id
        ORDER BY qs.submitted_at DESC
        LIMIT 4
    ");
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $submissions]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
?>
