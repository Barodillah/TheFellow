<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!$pdo) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) $data = $_POST;

$id = $data['id'] ?? null;
$title = $data['title'] ?? '';
$event_date = $data['event_date'] ?? '';
$description = $data['description'] ?? '';
$is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;

if (!$id || empty($title) || empty($event_date)) {
    echo json_encode(['status' => 'error', 'message' => 'ID, title and date are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE events SET title = ?, event_date = ?, description = ?, is_active = ? WHERE id = ?");
    $stmt->execute([$title, $event_date, $description, $is_active, $id]);
    echo json_encode(['status' => 'success', 'message' => 'Event updated']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
