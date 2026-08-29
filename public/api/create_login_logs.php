<?php
require_once 'config.php';
require_once 'debug.php'; // Includes CORS headers if necessary

// This script safely creates the login_logs table if it doesn't exist
$sql = "
CREATE TABLE IF NOT EXISTS `login_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

if ($conn->query($sql) === TRUE) {
    echo "Table 'login_logs' created successfully or already exists.";
} else {
    echo "Error creating table: " . $conn->error;
}
$conn->close();
?>
