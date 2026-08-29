<?php
require_once __DIR__ . '/config.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);

$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
$otp = isset($data['otp']) ? trim($data['otp']) : '';
$newPassword = isset($data['newPassword']) ? $data['newPassword'] : '';

if (empty($email) || empty($otp) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode(["error" => "Email, OTP, and new password are required."]);
    exit();
}

$stmt = $conn->prepare("SELECT id, resetToken, resetTokenExpiresAt FROM users WHERE email = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $conn->error]);
    exit();
}
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $now = date('Y-m-d H:i:s');
    
    // Check if token matches and is not expired
    if ($row['resetToken'] === $otp && $row['resetTokenExpiresAt'] > $now) {
        $userId = $row['id'];
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        
        // Update password and clear token
        $updateStmt = $conn->prepare("UPDATE users SET passwordHash = ?, resetToken = NULL, resetTokenExpiresAt = NULL WHERE id = ?");
        if (!$updateStmt) {
            http_response_code(500);
            echo json_encode(["error" => "Database error on update: " . $conn->error]);
            exit();
        }
        $updateStmt->bind_param("ss", $newHash, $userId);
        $updateStmt->execute();
        $updateStmt->close();
        
        log_user_activity($conn, $userId, "reset_password", "User successfully reset their password.");
        
        http_response_code(200);
        echo json_encode(["message" => "Password has been successfully reset!"]);
        exit();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or expired OTP code."]);
        exit();
    }
}

// User not found
http_response_code(400);
echo json_encode(["error" => "Invalid or expired OTP code."]);
exit();
?>
