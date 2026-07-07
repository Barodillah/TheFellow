<?php
require_once 'config.php';
header('Content-Type: application/json');

if (!isset($pdo) || $pdo === null) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

// Data dari FormData dikirim lewat $_POST untuk text/id, dan $_FILES untuk file
$id = $_POST['id'] ?? '';
if (empty($id)) {
    echo json_encode(['status' => 'error', 'message' => 'ID pengguna tidak valid.']);
    exit();
}

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'Gagal mengunggah file atau tidak ada file yang dipilih.']);
    exit();
}

$file = $_FILES['avatar'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
$maxSize = 2 * 1024 * 1024; // Maksimal 2MB

if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['status' => 'error', 'message' => 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.']);
    exit();
}

if ($file['size'] > $maxSize) {
    echo json_encode(['status' => 'error', 'message' => 'Ukuran file terlalu besar (maksimal 2MB).']);
    exit();
}

// Pastikan direktori uploads/avatar ada
$uploadDir = '../uploads/avatar/';
if (!is_dir($uploadDir)) {
    // Coba buat folder jika belum ada (pastikan folder parent punya permission yang sesuai)
    mkdir($uploadDir, 0755, true);
}

// Generate nama file unik agar tidak bertabrakan
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$fileName = 'avatar_' . $id . '_' . time() . '.' . $extension;
$destination = $uploadDir . $fileName;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // URL yang akan disimpan ke database (disesuaikan dengan domain/hosting)
    $avatarUrl = 'https://incsmsociety.site/uploads/avatar/' . $fileName;

    try {
        $stmt = $pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
        $stmt->execute([$avatarUrl, $id]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Avatar berhasil diperbarui',
            'avatar' => $avatarUrl
        ]);

    } catch (PDOException $e) {
        // Hapus file yang sudah terupload jika update DB gagal
        if (file_exists($destination)) {
            unlink($destination);
        }
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan file ke server (periksa permission folder).']);
}
?>
