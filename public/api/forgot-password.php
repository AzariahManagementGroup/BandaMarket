<?php
require_once __DIR__ . '/config.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(["error" => "Email is required."]);
    exit();
}

// Check if user exists
$stmt = $conn->prepare("SELECT id, fullName FROM users WHERE email = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $conn->error]);
    exit();
}
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $userId = $row['id'];
    $fullName = $row['fullName'];
    
    // Generate a 6-digit OTP
    $resetToken = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));
    
    // Save token
    $updateStmt = $conn->prepare("UPDATE users SET resetToken = ?, resetTokenExpiresAt = ? WHERE id = ?");
    if ($updateStmt) {
        $updateStmt->bind_param("sss", $resetToken, $expiresAt, $userId);
        $updateStmt->execute();
        $updateStmt->close();
    }
    
    // Send email
    $subject = "Password Reset - CameMark";
    $htmlBody = "
    <h3>Hello $fullName,</h3>
    <p>You requested a password reset for your CameMark account.</p>
    <p>Your password reset code is: <strong style='font-size: 20px; letter-spacing: 2px; color: #059669; padding: 10px; display: inline-block; background: #ecfdf5; border-radius: 8px;'>$resetToken</strong></p>
    <p>This code will expire in 15 minutes.</p>
    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
    ";
    
    send_html_email($email, $subject, $htmlBody, $conn);
    
    log_user_activity($conn, $userId, "forgot_password", "User requested a password reset OTP.");
}

// Always return 200 (to prevent email enumeration attacks)
http_response_code(200);
echo json_encode(["message" => "If an account with that email exists, we have sent a password reset code."]);
exit();
?>
