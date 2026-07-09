<?php
require_once 'config.php';
header('Content-Type: application/json');

if (!isset($pdo) || $pdo === null) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

try {
    $stmt = $pdo->query("SELECT id, registration_number, name, email, phone, role, title, csm_title, join_year, avatar, quote, bio, (SELECT COUNT(*) FROM publikasi WHERE user_id = users.id AND status = 'publish') AS stats_publikasi, stats_articles, stats_threads, stats_pdca_cases, created_at, (password IS NOT NULL AND password != '') AS has_password FROM users ORDER BY created_at DESC");
    $users = $stmt->fetchAll();
    
    echo json_encode([
        'status' => 'success',
        'users' => $users
    ]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
