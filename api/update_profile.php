<?php
require_once 'config.php';
header('Content-Type: application/json');

if (!isset($pdo) || $pdo === null) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? '';
if (empty($id)) {
    echo json_encode(['status' => 'error', 'message' => 'ID pengguna tidak valid.']);
    exit();
}

$name = $data['name'] ?? '';
$title = $data['title'] ?? '';
$csm_title = $data['csmTitle'] ?? '';
$bio = $data['bio'] ?? '';
$quote = $data['quote'] ?? '';
$specializations_str = $data['specializations'] ?? '';

// Convert comma separated string to JSON array
$specializations = [];
if (!empty($specializations_str)) {
    $specs = array_map('trim', explode(',', $specializations_str));
    $specs = array_filter($specs);
    $specializations = json_encode(array_values($specs));
} else {
    $specializations = json_encode([]);
}

try {
    $sql = "UPDATE users SET 
            name = ?, 
            title = ?, 
            csm_title = ?, 
            bio = ?, 
            quote = ?, 
            specializations = ? 
            WHERE id = ?";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $name,
        $title,
        $csm_title,
        $bio,
        $quote,
        $specializations,
        $id
    ]);
    
    // Ambil data terbaru untuk dikembalikan ke frontend
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    
    if ($user) {
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
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal mengambil data terbaru.']);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
