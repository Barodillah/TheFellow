<?php
require_once 'config.php';
require_once 'PHPMailer/Exception.php';
require_once 'PHPMailer/PHPMailer.php';
require_once 'PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? '';

if (empty($id)) {
    echo json_encode(['status' => 'error', 'message' => 'ID User tidak valid.']);
    exit();
}

try {
    // Ambil data user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['status' => 'error', 'message' => 'Pengguna tidak ditemukan.']);
        exit();
    }

    if (!empty($user['registration_number'])) {
        echo json_encode(['status' => 'error', 'message' => 'Pengguna sudah di-approve.']);
        exit();
    }

    $role = $user['role'];
    $prefix = ($role === 'admin' || $role === 'fellow') ? 'F-' : 'FM-';
    $startIdx = ($prefix === 'F-') ? 3 : 4; 
    
    // Cari nomor terakhir berdasarkan prefix
    $stmt = $pdo->prepare("SELECT registration_number FROM users WHERE registration_number LIKE ? ORDER BY CAST(SUBSTRING(registration_number, ?) AS UNSIGNED) DESC LIMIT 1");
    $stmt->execute([$prefix . '%', $startIdx]);
    $last_user = $stmt->fetch();
    
    $next_number = 1;
    if ($last_user && !empty($last_user['registration_number'])) {
        $last_number = (int) substr($last_user['registration_number'], $startIdx - 1);
        $next_number = $last_number + 1;
    }
    
    $registration_number = $prefix . str_pad($next_number, 3, '0', STR_PAD_LEFT);
    
    // Update pengguna
    $sql = "UPDATE users SET registration_number = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$registration_number, $id]);
    
    // Setup PHPMailer untuk Email Selamat Bergabung
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
    $mail->addAddress($user['email'], $user['name']);

    $loginUrl = 'https://incsmsociety.site/auth'; // Sesuaikan URL frontend jika perlu, asumsi sama
    
    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Selamat Bergabung - CSM Fellowship';
    $mail->Body    = "
        <div style='font-family: Arial, sans-serif; max-w-md; margin: auto;'>
            <div style='text-align: center; margin-bottom: 20px;'>
                <h2 style='color: #1A2744;'>Selamat Bergabung!</h2>
            </div>
            <p>Halo <strong>{$user['name']}</strong>,</p>
            <p>Selamat! Pengajuan keanggotaan Anda telah <strong>Disetujui</strong> oleh Administrator.</p>
            <p>Berikut adalah Nomor Registrasi Anda:</p>
            <h2 style='background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; letter-spacing: 2px; color: #C9A84C;'>{$registration_number}</h2>
            <p>Karena ini adalah akses pertama Anda, kata sandi Anda saat ini masih kosong. Silakan masuk ke aplikasi dan lakukan 'Lupa Password' menggunakan alamat email Anda untuk membuat kata sandi baru dan mengaktifkan akun.</p>
            <p style='background-color: #f8f9fa; padding: 15px; border-left: 4px solid #1A2744; margin-bottom: 20px;'>
                <strong>Cara Aktivasi Akun:</strong><br>
                Buka Portal CSM, masukkan Email Anda, lalu klik tulisan <strong>'Aktivasi Akun / Lupa Password'</strong> di bagian bawah form untuk mengatur kata sandi baru Anda.
            </p>
            <div style='text-align: center; margin-top: 30px; margin-bottom: 30px;'>
                <a href='{$loginUrl}' style='background-color: #1A2744; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Buka Portal CSM</a>
            </div>
            <p>Salam hangat,<br><strong>Tim CSM Intellectual Society</strong></p>
            <hr style='border: none; border-top: 1px solid #eee; margin-top: 30px;' />
            <p style='font-size: 11px; color: #888; text-align: center;'>Email ini dihasilkan secara otomatis, mohon tidak membalas email ini.</p>
        </div>
    ";

    $mail->send();

    echo json_encode([
        'status' => 'success',
        'message' => 'Pengguna berhasil disetujui.',
        'registration_number' => $registration_number
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'success', 
        'message' => 'Berhasil disetujui, tapi email notifikasi gagal dikirim.', 
        'registration_number' => $registration_number,
        'error' => $e->getMessage(),
        'mailer_error' => isset($mail) ? $mail->ErrorInfo : 'Mailer not initialized'
    ]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
