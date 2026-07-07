<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$otp = $data['otp'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($otp) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Email, OTP, dan Password baru harus diisi.']);
    exit();
}

try {
    // Validasi OTP
    $stmt = $pdo->prepare("SELECT id FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1");
    $stmt->execute([$email, $otp]);
    $valid_otp = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$valid_otp) {
        echo json_encode(['status' => 'error', 'message' => 'OTP tidak valid atau sudah kedaluwarsa.']);
        exit();
    }

    // Hash password baru
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Update password di tabel users
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt->execute([$hashed_password, $email]);

    // Hapus OTP yang sudah dipakai
    $stmt = $pdo->prepare("DELETE FROM otps WHERE email = ?");
    $stmt->execute([$email]);

    echo json_encode(['status' => 'success', 'message' => 'Password berhasil diubah.']);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
