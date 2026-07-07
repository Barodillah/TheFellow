<?php
require_once 'config.php';
header('Content-Type: application/json');

if (!isset($pdo) || $pdo === null) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$name = $data['name'] ?? '';
$phone = $data['phone'] ?? '';
$email = $data['email'] ?? '';
$role = $data['role'] ?? 'member';
$title = $data['title'] ?? '';
$join_year = $data['join_year'] ?? null;

if (empty($join_year)) {
    $join_year = date('Y');
}

if (empty($name) || empty($email) || empty($role)) {
    echo json_encode(['status' => 'error', 'message' => 'Nama, Email, dan Role harus diisi.']);
    exit();
}

// Cek apakah email sudah terdaftar
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['status' => 'error', 'message' => 'Email sudah terdaftar.']);
    exit();
}

// Fungsi sederhana pembuat UUID v4
function generate_uuid() {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

$id = generate_uuid();

// Generate registration number (F-001 atau FM-001)
$prefix = ($role === 'admin' || $role === 'fellow') ? 'F-' : 'FM-';

try {
    // Cari nomor terakhir berdasarkan prefix
    // substring index disesuaikan: F- -> 3, FM- -> 4
    $startIdx = ($prefix === 'F-') ? 3 : 4; 
    
    $stmt = $pdo->prepare("SELECT registration_number FROM users WHERE registration_number LIKE ? ORDER BY CAST(SUBSTRING(registration_number, ?) AS UNSIGNED) DESC LIMIT 1");
    $stmt->execute([$prefix . '%', $startIdx]);
    $last_user = $stmt->fetch();
    
    $next_number = 1;
    if ($last_user && !empty($last_user['registration_number'])) {
        $last_number = (int) substr($last_user['registration_number'], $startIdx - 1);
        $next_number = $last_number + 1;
    }
    
    $registration_number = $prefix . str_pad($next_number, 3, '0', STR_PAD_LEFT);
    
    // Insert pengguna baru (password otomatis null/kosong dari schema atau dilempar NULL)
    $sql = "INSERT INTO users (id, registration_number, phone, email, password, role, name, title, join_year) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id,
        $registration_number,
        $phone,
        $email,
        $role,
        $name,
        $title,
        $join_year
    ]);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Pengguna berhasil ditambahkan.',
        'user' => [
            'id' => $id,
            'registration_number' => $registration_number,
            'name' => $name,
            'email' => $email,
            'role' => $role
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
