<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require 'config.php';

if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Koneksi database gagal']);
    exit;
}

try {
    // Menghitung poin intelektual dari total skor kuis per pengguna
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.name, 
            u.avatar,
            u.role,
            u.csm_title,
            COALESCE(SUM(qs.score), 0) as total_points
        FROM users u
        LEFT JOIN quiz_submissions qs ON qs.user_id = u.id
        GROUP BY u.id
        ORDER BY total_points DESC, u.name ASC
        LIMIT 50
    ");
    $stmt->execute();
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Pastikan total_points bertipe integer untuk kemudahan di frontend
    $leaderboard = array_map(function($user) {
        $user['total_points'] = (int)$user['total_points'];
        return $user;
    }, $leaderboard);
    
    echo json_encode(['success' => true, 'data' => $leaderboard]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}
?>
