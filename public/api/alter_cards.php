<?php
require_once __DIR__ . '/config.php';

// Add status to cards if not exists
$conn->query("ALTER TABLE cards ADD COLUMN status VARCHAR(50) DEFAULT 'active'");

// Create card_transactions table
$conn->query("CREATE TABLE IF NOT EXISTS card_transactions (
    id VARCHAR(100) PRIMARY KEY,
    cardId VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XAF',
    merchant VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cardId) REFERENCES cards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

echo "Database updated successfully.\n";
?>
