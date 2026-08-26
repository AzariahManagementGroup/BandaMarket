<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once "public/api/config.php";

$email = "info@azariahmg.com";
$password = "test";

$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

$requiresOtp = true; // force OTP

if ($requiresOtp) {
    echo "Generating OTP...\n";
    $otpCode = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $otpExpiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));
    
    echo "Saving OTP to DB...\n";
    $otpStmt = $conn->prepare("UPDATE users SET otpCode = ?, otpExpiresAt = ? WHERE id = ?");
    if (!$otpStmt) {
        die("Prepare failed: " . $conn->error);
    }
    $otpStmt->bind_param("sss", $otpCode, $otpExpiresAt, $row['id']);
    if (!$otpStmt->execute()) {
        die("Execute failed: " . $otpStmt->error);
    }
    $otpStmt->close();
    
    echo "Sending email...\n";
    $subject = "Your CameMark Login OTP";
    $htmlBody = "<h3>CameMark Login</h3><p>Your OTP code is: <strong>" . $otpCode . "</strong></p>";
    $emailRes = send_html_email($email, $subject, $htmlBody, $conn);
    echo "Email result: " . ($emailRes ? "true" : "false") . "\n";
    echo "Done.\n";
}
?>
