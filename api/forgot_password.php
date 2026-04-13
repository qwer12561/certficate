<?php
require_once 'db.php';
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

if (empty($email)) {
    echo json_encode(['success' => false, 'error' => 'Email is required']);
    exit;
}

$db = getDB();
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    $update_stmt = $db->prepare("UPDATE users SET reset_token = ?, token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?");
    $update_stmt->bind_param("si", $code, $user['id']);

    if ($update_stmt->execute()) {
        $reset_link = "http://localhost/breti/reset-password.html?email=" . urlencode($email);
        
        // --- REAL EMAIL SENDING SECTION ---
        require '../vendor/autoload.php';
        $mail_config = require 'mailer_config.php';

        $mail = new PHPMailer(true);
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = $mail_config['host'];
            $mail->SMTPAuth   = $mail_config['auth'];
            $mail->Username   = $mail_config['username'];
            $mail->Password   = $mail_config['password'];
            $mail->SMTPSecure = $mail_config['secure'];
            $mail->Port       = $mail_config['port'];

            // Recipients
            $mail->setFrom($mail_config['from_email'], $mail_config['from_name']);
            $mail->addAddress($email);

            // Content
            $mail->isHTML(true);
            $mail->Subject = 'Security Verification Code';
            
            // Modern HTML Template with inline styles for maximum compatibility
            $mail->Body = "
                <div style='font-family: Arial, sans-serif; background-color: #0a192f; padding: 40px 20px; color: #8892b0;'>
                    <div style='max-width: 500px; margin: 0 auto; background-color: #172a45; border-radius: 16px; border: 1px solid rgba(100, 255, 218, 0.2); padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
                        <div style='font-size: 28px; font-weight: bold; color: #64ffda; margin-bottom: 25px; letter-spacing: 2px;'>CMS</div>
                        <h1 style='color: #ccd6f6; font-size: 22px; margin-bottom: 15px;'>Security Verification</h1>
                        <p style='font-size: 15px; line-height: 1.6; margin-bottom: 30px;'>A password reset was requested for your account. Please use the high-security code below to continue.</p>
                        
                        <div style='background: rgba(100, 255, 218, 0.05); border: 2px dashed #64ffda; border-radius: 12px; padding: 25px; margin: 20px 0; display: inline-block; min-width: 200px;'>
                            <span style='font-size: 38px; font-weight: bold; color: #64ffda; letter-spacing: 8px; font-family: Courier New, Courier, monospace;'>$code</span>
                        </div>
                        
                        <p style='font-size: 13px; margin: 25px 0;'>This security code is valid for <b>1 hour</b>.</p>
                        
                        <a href='$reset_link' style='display: inline-block; background-color: #64ffda; color: #0a192f; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px;'>Reset Password</a>
                        
                        <div style='margin-top: 40px; padding-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 11px; line-height: 1.5;'>
                            If you did not request this password reset, please ignore this email or contact our security team if you have concerns.
                        </div>
                    </div>
                </div>";
            
            $mail->AltBody = "Security Verification Code: $code\n\nReset your password here: $reset_link\n\nThis code is valid for 1 hour.";

            $mail->send();
            $email_sent = true;
        } catch (Exception $e) {
            $email_sent = false;
            // Log error
            file_put_contents('mailer_errors.log', date('Y-m-d H:i:s') . " - Mailer Error: " . $mail->ErrorInfo . "\n", FILE_APPEND);
        }
        // --- END EMAIL SENDING SECTION ---

        // Simulate sending email by logging to a file (legacy)
        $log_entry = date('Y-m-d H:i:s') . " - Security Code for $email: $code\n";
        file_put_contents('reset_logs.txt', $log_entry, FILE_APPEND);

        echo json_encode([
            'success' => true, 
            'message' => $email_sent ? 'Security code has been sent to your Gmail.' : 'Reset requested. Check your email or code box below.',
            'debug_code' => $code, // Keeping for now during setup
            'debug_link' => $reset_link
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to generate reset token']);
    }
} else {
    // For security, don't reveal that the email doesn't exist
    echo json_encode(['success' => true, 'message' => 'If an account exists with this email, you will receive a reset link shortly.']);
}

$db->close();
?>
