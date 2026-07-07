<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';

if (empty($email)) {
    echo json_encode(['status' => 'error', 'message' => 'Email tidak boleh kosong.']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ($user['password'] === null || $user['password'] === '') {
            echo json_encode(['status' => 'success', 'exists' => true, 'is_active' => false]);
        } else {
            echo json_encode(['status' => 'success', 'exists' => true, 'is_active' => true]);
        }
    } else {
        echo json_encode(['status' => 'success', 'exists' => false]);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
