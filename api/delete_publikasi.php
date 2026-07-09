<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? '';

if (empty($id)) {
    echo json_encode(['status' => 'error', 'message' => 'ID harus diisi.']);
    exit();
}

try {
    // Get file names to delete
    $stmt = $pdo->prepare("SELECT file_name, cover_name FROM publikasi WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        $pdfDir = '../pdf/';
        $coverDir = '../pdf/cover/';
        
        if ($existing['file_name'] && file_exists($pdfDir . $existing['file_name'])) {
            unlink($pdfDir . $existing['file_name']);
        }
        if ($existing['cover_name'] && file_exists($coverDir . $existing['cover_name'])) {
            unlink($coverDir . $existing['cover_name']);
        }
        
        $stmt = $pdo->prepare("DELETE FROM publikasi WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['status' => 'success', 'message' => 'Publikasi berhasil dihapus.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Publikasi tidak ditemukan.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
