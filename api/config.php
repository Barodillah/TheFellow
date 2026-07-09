<?php
// Izinkan akses CORS dari domain mana saja
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Jika request adalah OPTIONS (preflight CORS), berikan respons sukses lalu exit
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Pengaturan koneksi database
$db_host = ''; // Sesuaikan jika menggunakan host berbeda
$db_name = ''; // Ganti dengan nama database Anda
$db_user = ''; // Ganti dengan username database Anda
$db_pass = ''; // Ganti dengan password database Anda

try {
    $dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    // Pada script lainnya, kegagalan koneksi mungkin bisa di-handle berbeda.
    // Di config, kita sediakan variabel null jika error, agar health.php bisa membacanya.
    $pdo = null;
    $db_error = $e->getMessage();
}
