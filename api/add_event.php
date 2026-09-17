<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!$pdo) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) $data = $_POST;

$title = $data['title'] ?? '';
$event_date = $data['event_date'] ?? '';
$description = $data['description'] ?? '';
$is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;

if (empty($title) || empty($event_date)) {
    echo json_encode(['status' => 'error', 'message' => 'Title and date are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO events (title, event_date, description, is_active) VALUES (?, ?, ?, ?)");
    $stmt->execute([$title, $event_date, $description, $is_active]);
    echo json_encode(['status' => 'success', 'message' => 'Event added']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
