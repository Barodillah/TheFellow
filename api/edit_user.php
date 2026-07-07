<?php
require_once 'config.php';
header('Content-Type: application/json');

if (!isset($pdo) || $pdo === null) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? '';
$name = $data['name'] ?? '';
$phone = $data['phone'] ?? '';
$email = $data['email'] ?? '';
$role = $data['role'] ?? 'member';
$title = $data['title'] ?? '';
$join_year = $data['join_year'] ?? null;

if (empty($id) || empty($name) || empty($email) || empty($role)) {
    echo json_encode(['status' => 'error', 'message' => 'ID, Nama, Email, dan Role harus diisi.']);
    exit();
}

try {
    // Pastikan email tidak bentrok dengan akun orang lain
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $id]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Email sudah digunakan pengguna lain.']);
        exit();
    }

    $sql = "UPDATE users SET name = ?, phone = ?, email = ?, role = ?, title = ?, join_year = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name, $phone, $email, $role, $title, $join_year, $id]);
    
    echo json_encode(['status' => 'success', 'message' => 'Data pengguna berhasil diperbarui.']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
