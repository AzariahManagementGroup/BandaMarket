<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

$results = [];

function addColumnIfNotExists($conn, $table, $column, $definition) {
    global $results;
    $check = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    if ($check && $check->num_rows == 0) {
        if ($conn->query("ALTER TABLE `$table` ADD COLUMN `$column` $definition")) {
            $results[] = "Added column $column to $table";
        } else {
            $results[] = "Error adding $column to $table: " . $conn->error;
        }
    } else {
        $results[] = "Column $column already exists in $table";
    }
}

// Check and update users table
addColumnIfNotExists($conn, 'users', 'otpCode', 'varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL');
addColumnIfNotExists($conn, 'users', 'otpExpiresAt', 'datetime(3) DEFAULT NULL');
addColumnIfNotExists($conn, 'users', 'lastLoginAt', 'datetime(3) DEFAULT NULL');
addColumnIfNotExists($conn, 'users', 'isVerified', 'tinyint(1) NOT NULL DEFAULT 0');

// Create wallets table if missing
$walletsSql = "CREATE TABLE IF NOT EXISTS `wallets` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` double NOT NULL DEFAULT 0,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'XAF',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallets_userId_key` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($walletsSql)) {
    $results[] = "Wallets table checked/created";
} else {
    $results[] = "Error with wallets table: " . $conn->error;
}

// Create login_logs table if missing
$loginLogsSql = "CREATE TABLE IF NOT EXISTS `login_logs` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `ipAddress` varchar(45) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('SUCCESS','FAILED') NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($loginLogsSql)) {
    $results[] = "Login_logs table checked/created";
} else {
    $results[] = "Error with login_logs table: " . $conn->error;
}

echo json_encode(["status" => "success", "results" => $results]);
$conn->close();
?>
