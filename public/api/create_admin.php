<?php
require_once __DIR__ . '/config.php';

$email = 'info@azariahmg.com';
$password = 'Admin@webmaster$1';
$passwordHash = password_hash($password, PASSWORD_BCRYPT);
$fullName = 'Super Admin';
$role = 'admin';
$id = bin2hex(random_bytes(16));
$now = date('Y-m-d H:i:s.v');

// Check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Update existing user
    $updateStmt = $conn->prepare("UPDATE users SET passwordHash = ?, role = ?, isVerified = 1 WHERE email = ?");
    $updateStmt->bind_param("sss", $passwordHash, $role, $email);
    if ($updateStmt->execute()) {
        echo "Admin user updated successfully. Password and role reset.";
    } else {
        echo "Error updating admin user: " . $conn->error;
    }
} else {
    // Insert new user
    $insertStmt = $conn->prepare("INSERT INTO users (id, email, passwordHash, fullName, role, isVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, ?, ?)");
    $insertStmt->bind_param("sssssss", $id, $email, $passwordHash, $fullName, $role, $now, $now);
    if ($insertStmt->execute()) {
        echo "Admin user created successfully.";
    } else {
        echo "Error creating admin user: " . $conn->error;
    }
}

$stmt->close();
$conn->close();
?>
