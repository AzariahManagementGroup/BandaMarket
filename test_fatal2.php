<?php
require_once "public/api/config.php";
ini_set("display_errors", "1");
error_reporting(-1);

$email = "info@azariahmg.com";
$password = "test";

$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

echo "Generating OTP...\n";
$otpCode = str_pad(mt_rand(0, 999999), 6, "0", STR_PAD_LEFT);
$otpExpiresAt = date("Y-m-d H:i:s", strtotime("+15 minutes"));
$subject = "Your CameMark Login OTP";
$htmlBody = "<h3>CameMark Login</h3>";
echo "Sending email...\n";
send_html_email($email, $subject, $htmlBody, $conn);
echo "Done.\n";
?>
