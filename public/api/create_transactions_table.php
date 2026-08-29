<?php
require_once 'config.php';
require_once 'debug.php'; // Includes CORS headers if necessary

// This script safely creates the transactions table if it doesn't exist
$sql = "
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('deposit', 'withdrawal', 'transfer', 'payment', 'refund') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'payment',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'XAF',
  `status` enum('pending', 'completed', 'failed', 'cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

if ($conn->query($sql) === TRUE) {
    echo "Table 'transactions' created successfully or already exists.";
} else {
    echo "Error creating table: " . $conn->error;
}
$conn->close();
?>
