<?php
require_once __DIR__ . '/config.php';

try {
    $conn->query("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
    echo "Added status column.\n";
} catch (Exception $e) {
    echo "Status: " . $e->getMessage() . "\n";
}

try {
    $conn->query("ALTER TABLE users ADD COLUMN warningCount INT DEFAULT 0");
    echo "Added warningCount column.\n";
} catch (Exception $e) {
    echo "WarningCount: " . $e->getMessage() . "\n";
}

echo "Done.";
?>
