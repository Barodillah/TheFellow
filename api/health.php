<?php
require_once 'config.php';

// Pastikan konten dikembalikan sebagai JSON
header('Content-Type: application/json');

$response = [
    'status' => 'ok',
    'message' => 'API is running',
    'database' => 'disconnected',
    'timestamp' => date('Y-m-d H:i:s')
];

// Cek koneksi database menggunakan variabel $pdo dari config.php
if (isset($pdo) && $pdo !== null) {
    try {
        // Coba lakukan query sederhana
        $stmt = $pdo->query("SELECT 1");
        if ($stmt) {
            $response['database'] = 'connected';
        }
    } catch (PDOException $e) {
        $response['database'] = 'error: ' . $e->getMessage();
    }
} else {
    // Menampilkan pesan error dari config.php jika ada
    $response['database'] = 'failed to connect' . (isset($db_error) ? ': ' . $db_error : '');
}

echo json_encode($response);
