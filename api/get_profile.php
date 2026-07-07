<?php
require_once 'config.php';
header('Content-Type: application/json');

if (!isset($pdo) || $pdo === null) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

$id = $_GET['id'] ?? '';

if (empty($id)) {
    echo json_encode(['status' => 'error', 'message' => 'ID tidak diberikan']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT id, registration_number, email, phone, role, name, title, csm_title, join_year, avatar, bio, quote, specializations, badges, stats_articles, stats_threads, stats_pdca_cases, created_at FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Parse JSON fields
        if ($user['specializations']) {
            $user['specializations'] = json_decode($user['specializations'], true);
        } else {
            $user['specializations'] = [];
        }
        
        if ($user['badges']) {
            $user['badges'] = json_decode($user['badges'], true);
        } else {
            $user['badges'] = [];
        }

        echo json_encode([
            'status' => 'success',
            'user' => $user
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Pengguna tidak ditemukan']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
