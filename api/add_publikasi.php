<?php
require_once 'config.php';
header('Content-Type: application/json');

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit();
}

$max_size = 50 * 1024 * 1024; // 50MB

$user_id = $_POST['user_id'] ?? '';
$title = $_POST['title'] ?? '';
$description = $_POST['description'] ?? '';
$category = $_POST['category'] ?? '';
$visibility = $_POST['visibility'] ?? 'public';
$status = $_POST['status'] ?? 'draft';
$tags = isset($_POST['tags']) ? json_decode($_POST['tags'], true) : [];

if (empty($user_id) || empty($title) || empty($category)) {
    echo json_encode(['status' => 'error', 'message' => 'User ID, Judul, dan Kategori harus diisi.']);
    exit();
}

$pdfDir = '../pdf/';
$coverDir = '../pdf/cover/';

// Create directories if they don't exist
if (!is_dir($pdfDir)) mkdir($pdfDir, 0777, true);
if (!is_dir($coverDir)) mkdir($coverDir, 0777, true);

$file_name = '';
$cover_name = '';

// Handle PDF upload
if (isset($_FILES['pdf_file']) && $_FILES['pdf_file']['error'] === UPLOAD_ERR_OK) {
    if ($_FILES['pdf_file']['size'] > $max_size) {
        echo json_encode(['status' => 'error', 'message' => 'Ukuran file PDF melebihi 50MB.']);
        exit();
    }
    
    $ext = pathinfo($_FILES['pdf_file']['name'], PATHINFO_EXTENSION);
    if (strtolower($ext) !== 'pdf') {
        echo json_encode(['status' => 'error', 'message' => 'Hanya file PDF yang diperbolehkan.']);
        exit();
    }
    
    $file_name = uniqid('doc_') . '_' . bin2hex(random_bytes(4)) . '.pdf';
    move_uploaded_file($_FILES['pdf_file']['tmp_name'], $pdfDir . $file_name);
} else {
    echo json_encode(['status' => 'error', 'message' => 'File PDF harus diunggah.']);
    exit();
}

// Handle Cover upload
if (isset($_FILES['cover_file']) && $_FILES['cover_file']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['cover_file']['name'], PATHINFO_EXTENSION);
    $valid_image_ext = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array(strtolower($ext), $valid_image_ext)) {
        echo json_encode(['status' => 'error', 'message' => 'Format cover tidak valid (jpg, jpeg, png, webp).']);
        exit();
    }
    
    $cover_name = uniqid('cov_') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    move_uploaded_file($_FILES['cover_file']['tmp_name'], $coverDir . $cover_name);
}

try {
    $pdo->beginTransaction();

    $sql = "INSERT INTO publikasi (user_id, title, description, category, file_name, cover_name, visibility, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id, $title, $description, $category, $file_name, $cover_name, $visibility, $status]);
    
    $publikasi_id = $pdo->lastInsertId();

    if (!empty($tags) && is_array($tags)) {
        $tag_sql = "INSERT INTO publikasi_tags (publikasi_id, tag_name) VALUES (?, ?)";
        $tag_stmt = $pdo->prepare($tag_sql);
        foreach ($tags as $tag) {
            $tag_name = trim($tag);
            if (!empty($tag_name)) {
                $tag_stmt->execute([$publikasi_id, $tag_name]);
            }
        }
    }

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Publikasi berhasil ditambahkan.']);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
