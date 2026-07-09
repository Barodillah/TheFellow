<?php
require_once 'config.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT p.*, u.name as author_name, 
            GROUP_CONCAT(t.tag_name SEPARATOR ',') as tags_str
            FROM publikasi p 
            JOIN users u ON p.user_id = u.id 
            LEFT JOIN publikasi_tags t ON p.id = t.publikasi_id
            GROUP BY p.id
            ORDER BY p.created_at DESC";
    $stmt = $pdo->query($sql);
    $publikasi = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process URLs and tags for frontend
    foreach ($publikasi as &$p) {
        $p['fileUrl'] = '/pdf/' . $p['file_name'];
        $p['coverImg'] = $p['cover_name'] ? '/pdf/cover/' . $p['cover_name'] : null;
        $p['author'] = $p['author_name']; // Map to author field for frontend
        $p['tags'] = $p['tags_str'] ? explode(',', $p['tags_str']) : [];
        unset($p['tags_str']);
    }
    
    echo json_encode(['status' => 'success', 'data' => $publikasi]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
