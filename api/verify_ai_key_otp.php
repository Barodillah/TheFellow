<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan.']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$email = trim($data['email'] ?? '');
$otp = preg_replace('/\D/', '', trim($data['otp'] ?? ''));

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email tidak valid atau kosong.']);
    exit();
}

if (empty($otp) || strlen($otp) !== 6) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Kode OTP harus berupa 6 digit angka.']);
    exit();
}

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database tidak tersedia.']);
    exit();
}

try {
    // Validasi kecocokan OTP dan masa berlaku
    $stmt = $pdo->prepare("SELECT id FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1");
    $stmt->execute([$email, $otp]);
    $validOtp = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$validOtp) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa. Silakan request kode baru.'
        ]);
        exit();
    }

    // Hapus OTP yang sudah berhasil diverifikasi agar tidak bisa dipakai ulang
    $del = $pdo->prepare("DELETE FROM otps WHERE email = ?");
    $del->execute([$email]);

    // Ambil API Key dari config.php
    $apiKey = defined('OPENROUTER_API_KEY') ? OPENROUTER_API_KEY : ($openrouter_api_key ?? '');

    if (empty($apiKey)) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'API Key belum diset di backend config.php.'
        ]);
        exit();
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Verifikasi OTP berhasil! Berikut adalah API Key Anda.',
        'apiKey' => $apiKey,
        'appUrl' => 'https://wai.bewhy.id'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Kesalahan database: ' . $e->getMessage()]);
}
