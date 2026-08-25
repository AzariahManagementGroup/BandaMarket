<?php
require 'public/api/config.php';
$conn->query("ALTER TABLE users ADD COLUMN status ENUM('active', 'banned') DEFAULT 'active'");
$conn->query("ALTER TABLE users ADD COLUMN warningCount INT DEFAULT 0");
$conn->query("CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adminId VARCHAR(36) NOT NULL,
    targetUserId VARCHAR(36),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE
)");
echo 'Done';
?>
