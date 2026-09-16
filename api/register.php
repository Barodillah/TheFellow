<?php
require_once 'config.php';
require_once 'PHPMailer/Exception.php';
require_once 'PHPMailer/PHPMailer.php';
require_once 'PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$bio = $data['bio'] ?? '';

if (empty($name) || empty($email) || empty($phone) || empty($bio)) {
    echo json_encode(['status' => 'error', 'message' => 'Semua kolom wajib diisi.']);
    exit();
}

try {
    // Cek apakah email sudah terdaftar
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Email ini sudah terdaftar. Silakan gunakan email lain atau langsung Login.']);
        exit();
    }

    $id = bin2hex(random_bytes(16)); // UUID-like 32 chars
    // Tambahkan dash agar mirip format UUID (36 chars)
    $id = substr($id,0,8).'-'.substr($id,8,4).'-'.substr($id,12,4).'-'.substr($id,16,4).'-'.substr($id,20,12);

    // Insert ke tabel users
    // Role 'member', registration_number NULL, password NULL
    $stmt = $pdo->prepare("INSERT INTO users (id, name, email, phone, bio, role) VALUES (?, ?, ?, ?, ?, 'member')");
    $stmt->execute([$id, $name, $email, $phone, $bio]);

    // Setup PHPMailer
    $mail = new PHPMailer(true);
    
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'noreply@incsmsociety.site';
    $mail->Password   = 'Fellow.666';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;

    // Recipients
    $mail->setFrom('noreply@incsmsociety.site', 'CSM Intellectual Society');
    $mail->addAddress($email, $name);

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Terima Kasih - Pengajuan Keanggotaan Diterima';
    $mail->Body    = "
        <div style='font-family: Arial, sans-serif; max-w-md; margin: auto;'>
            <div style='text-align: center; margin-bottom: 20px;'>
                <h2 style='color: #1A2744;'>Permintaan Keanggotaan Berhasil</h2>
            </div>
            <p>Halo <strong>{$name}</strong>,</p>
            <p>Terima kasih telah mengajukan diri untuk bergabung ke dalam <strong>CSM Fellowship Intellectual Society</strong>.</p>
            <p>Sistem kami telah menerima pengajuan Anda. Saat ini pengajuan Anda sedang berada dalam tahap <strong>Pending Approval (Menunggu Persetujuan)</strong> oleh administrator kami.</p>
            <p>Jika pengajuan Anda disetujui, kami akan mengirimkan email pemberitahuan beserta nomor registrasi keanggotaan dan tautan aktivasi akun.</p>
            <br>
            <p>Salam hangat,<br><strong>Tim CSM Intellectual Society</strong></p>
            <hr style='border: none; border-top: 1px solid #eee; margin-top: 30px;' />
            <p style='font-size: 11px; color: #888; text-align: center;'>Email ini dihasilkan secara otomatis, mohon tidak membalas email ini.</p>
        </div>
    ";

    $mail->send();
    echo json_encode(['status' => 'success', 'message' => 'Pengajuan berhasil dikirim! Silakan periksa email Anda.']);

} catch (Exception $e) {
    // Kalau email gagal terkirim, datanya tetap masuk, jadi kita sampaikan pesan tetap success tapi dengan warning
    echo json_encode(['status' => 'success', 'message' => 'Pengajuan berhasil dikirim, namun terjadi kesalahan saat mengirim email notifikasi.']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
