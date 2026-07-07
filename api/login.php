<?php
require_once 'config.php';
header('Content-Type: application/json');

// Jika koneksi gagal, kembalikan error
if (!isset($pdo) || $pdo === null) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

// Baca data JSON dari body request
$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Email dan password harus diisi.']);
    exit();
}

try {
    // Cari user berdasarkan email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // Cek password. Memungkinkan login dengan password hash (password_verify) atau password plain-text (untuk testing awal)
        if (password_verify($password, $user['password']) || $password === $user['password']) {
            // Login sukses
            
            // Jangan kirim password ke frontend untuk keamanan
            unset($user['password']);
            
            // Format ulang agar sesuai dengan frontend (camelCase & array)
            if (isset($user['csm_title'])) {
                $user['csmTitle'] = $user['csm_title'];
            }
            if (isset($user['join_year'])) {
                $user['joinYear'] = $user['join_year'];
            }
            if (!empty($user['specializations'])) {
                $user['specializations'] = json_decode($user['specializations'], true);
            } else {
                $user['specializations'] = [];
            }
            if (!empty($user['badges'])) {
                $user['badges'] = json_decode($user['badges'], true);
            } else {
                $user['badges'] = [];
            }
            
            // Map stats jika diperlukan
            $user['stats'] = [
                'articles' => (int)($user['stats_articles'] ?? 0),
                'threads' => (int)($user['stats_threads'] ?? 0),
                'pdcaCases' => (int)($user['stats_pdca_cases'] ?? 0),
            ];
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Login berhasil',
                'user' => $user
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Email atau password salah.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Email atau password salah.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
