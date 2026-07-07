<?php
require_once 'config.php';
require_once 'PHPMailer/Exception.php';
require_once 'PHPMailer/PHPMailer.php';
require_once 'PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';

if (empty($email)) {
    echo json_encode(['status' => 'error', 'message' => 'Email tidak boleh kosong.']);
    exit();
}

try {
    // Pastikan email terdaftar
    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['status' => 'error', 'message' => 'Email tidak terdaftar.']);
        exit();
    }

    // Generate 6 digit OTP
    $otp = sprintf("%06d", mt_rand(1, 999999));
    $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));

    // Insert ke tabel otps
    $stmt = $pdo->prepare("INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$email, $otp, $expires_at]);

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
    $mail->addAddress($email, $user['name']);

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Kode OTP Anda - CSM Fellowship';
    $mail->Body    = "
        <div style='font-family: Arial, sans-serif; max-w-md; margin: auto;'>
            <h2>Kode Verifikasi Anda</h2>
            <p>Halo {$user['name']},</p>
            <p>Kode OTP Anda untuk melanjutkan proses di portal CSM Fellowship adalah:</p>
            <h1 style='background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; letter-spacing: 5px;'>{$otp}</h1>
            <p>Kode ini berlaku selama 10 menit. Jangan beritahu kode ini kepada siapapun.</p>
            <hr />
            <p style='font-size: 12px; color: #888;'>CSM Intellectual Society</p>
        </div>
    ";

    $mail->send();
    echo json_encode(['status' => 'success', 'message' => 'OTP berhasil dikirim.']);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Gagal mengirim email. Mailer Error: ' . $mail->ErrorInfo]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
