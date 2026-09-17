<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!$pdo) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

try {
    $stmt = $pdo->query("SELECT * FROM events ORDER BY created_at DESC");
    $events = $stmt->fetchAll();
    
    // Konversi is_active ke boolean untuk frontend
    $events = array_map(function($ev) {
        $ev['is_active'] = (bool)$ev['is_active'];
        return $ev;
    }, $events);

    echo json_encode(['status' => 'success', 'data' => $events]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
