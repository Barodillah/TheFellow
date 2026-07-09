<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit();
}

$id = $_POST['id'] ?? '';
$title = $_POST['title'] ?? '';
$description = $_POST['description'] ?? '';
$category = $_POST['category'] ?? '';
$visibility = $_POST['visibility'] ?? 'public';
$status = $_POST['status'] ?? 'draft';
$tags = isset($_POST['tags']) ? json_decode($_POST['tags'], true) : [];
$user_id = $_POST['user_id'] ?? '';

if (empty($id) || empty($title) || empty($category)) {
    echo json_encode(['status' => 'error', 'message' => 'ID, Judul, dan Kategori harus diisi.']);
    exit();
}

try {
    // Get existing data
    $stmt = $pdo->prepare("SELECT file_name, cover_name FROM publikasi WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existing) {
        echo json_encode(['status' => 'error', 'message' => 'Publikasi tidak ditemukan.']);
        exit();
    }
    
    $file_name = $existing['file_name'];
    $cover_name = $existing['cover_name'];
    
    $pdfDir = '../pdf/';
    $coverDir = '../pdf/cover/';
    $max_size = 50 * 1024 * 1024; // 50MB

    // Handle PDF upload if any
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
        // Delete old file
        if ($file_name && file_exists($pdfDir . $file_name)) {
            unlink($pdfDir . $file_name);
        }
        $file_name = uniqid('doc_') . '_' . bin2hex(random_bytes(4)) . '.pdf';
        move_uploaded_file($_FILES['pdf_file']['tmp_name'], $pdfDir . $file_name);
    }
    
    // Handle Cover upload if any
    if (isset($_FILES['cover_file']) && $_FILES['cover_file']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['cover_file']['name'], PATHINFO_EXTENSION);
        $valid_image_ext = ['jpg', 'jpeg', 'png', 'webp'];
        if (!in_array(strtolower($ext), $valid_image_ext)) {
            echo json_encode(['status' => 'error', 'message' => 'Format cover tidak valid (jpg, jpeg, png, webp).']);
            exit();
        }
        // Delete old cover
        if ($cover_name && file_exists($coverDir . $cover_name)) {
            unlink($coverDir . $cover_name);
        }
        $cover_name = uniqid('cov_') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        move_uploaded_file($_FILES['cover_file']['tmp_name'], $coverDir . $cover_name);
    }

    $pdo->beginTransaction();

    $sql = "UPDATE publikasi SET title = ?, description = ?, category = ?, file_name = ?, cover_name = ?, visibility = ?, status = ?";
    $params = [$title, $description, $category, $file_name, $cover_name, $visibility, $status];

    if (!empty($user_id)) {
        $sql .= ", user_id = ?";
        $params[] = $user_id;
    }

    $sql .= " WHERE id = ?";
    $params[] = $id;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Update tags
    $del_stmt = $pdo->prepare("DELETE FROM publikasi_tags WHERE publikasi_id = ?");
    $del_stmt->execute([$id]);

    if (!empty($tags) && is_array($tags)) {
        $tag_sql = "INSERT INTO publikasi_tags (publikasi_id, tag_name) VALUES (?, ?)";
        $tag_stmt = $pdo->prepare($tag_sql);
        foreach ($tags as $tag) {
            $tag_name = trim($tag);
            if (!empty($tag_name)) {
                $tag_stmt->execute([$id, $tag_name]);
            }
        }
    }

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Publikasi berhasil diupdate.']);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
