<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan.']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);
$email = trim($data['email'] ?? '');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email tidak valid atau kosong.']);
    exit();
}

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database tidak tersedia.']);
    exit();
}

try {
    // Pastikan email terdaftar di sistem The Fellow
    $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Email tidak terdaftar sebagai anggota The Fellow.']);
        exit();
    }

    $userName = htmlspecialchars($user['name'] ?? 'Anggota', ENT_QUOTES, 'UTF-8');

    // Generate 6 digit OTP acak
    $otp = sprintf("%06d", mt_rand(1, 999999));
    $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));

    // Hapus OTP lama yang belum terpakai untuk email ini
    $delStmt = $pdo->prepare("DELETE FROM otps WHERE email = ?");
    $delStmt->execute([$email]);

    // Simpan OTP baru ke tabel otps
    $insStmt = $pdo->prepare("INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)");
    $insStmt->execute([$email, $otp, $expires_at]);

    // Kirim email OTP menggunakan PHPMailer
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'noreply@incsmsociety.site';
    $mail->Password   = 'Fellow.666';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom('noreply@incsmsociety.site', 'The Fellow - CSM Society');
    $mail->addAddress($email, $userName);

    $mail->isHTML(true);
    $mail->Subject = 'Kode OTP Akses API Key AI Roleplay - The Fellow CSM';
    $mail->Body    = "
        <div style='background-color: #f8fafc; padding: 30px 15px; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>
            <div style='max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;'>
                <div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center;'>
                    <h1 style='color: #d4af37; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.5px;'>THE FELLOW</h1>
                    <p style='color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;'>CSM Intellectual Society</p>
                </div>
                <div style='padding: 32px 28px;'>
                    <h2 style='font-size: 18px; color: #0f172a; margin-top: 0; font-weight: 700;'>Verifikasi Akses AI Roleplay</h2>
                    <p style='color: #475569; font-size: 14px; line-height: 1.6;'>Halo <strong>{$userName}</strong>,</p>
                    <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                        Anda menerima email ini karena ada permintaan untuk menampilkan <strong>API Key</strong> aplikasi 
                        <a href='https://wai.bewhy.id' target='_blank' style='color: #2563eb; text-decoration: none; font-weight: 600;'>AI Roleplay (wai.bewhy.id)</a>.
                    </p>
                    <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                        Gunakan kode OTP 6 digit berikut pada halaman web:
                    </p>
                    <div style='background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;'>
                        <span style='font-family: monospace, Courier; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a;'>{$otp}</span>
                    </div>
                    <p style='color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;'>
                        ⏱️ Kode OTP ini berlaku selama <strong>10 menit</strong>. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini dan akun Anda tetap aman.
                    </p>
                </div>
                <div style='background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center;'>
                    <p style='color: #94a3b8; font-size: 12px; margin: 0;'>
                        The Fellow &bull; Customer Experience & Service Management Society
                    </p>
                </div>
            </div>
        </div>
    ";

    $mail->send();

    // Masked email for response, e.g. j***@domain.com
    $parts = explode('@', $email);
    $maskedName = substr($parts[0], 0, 1) . str_repeat('*', max(1, strlen($parts[0]) - 2)) . substr($parts[0], -1);
    $maskedEmail = $maskedName . '@' . ($parts[1] ?? '');

    echo json_encode([
        'status' => 'success',
        'message' => 'Kode OTP berhasil dikirim ke ' . $maskedEmail,
        'email' => $email
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal mengirim email OTP: ' . ($mail->ErrorInfo ?? $e->getMessage())]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Kesalahan database: ' . $e->getMessage()]);
}
