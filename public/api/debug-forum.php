<?php
// Standalone raw test - no config.php dependency
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$result = [];

// PHP version
$result['php_version'] = PHP_VERSION;

// Check mysqli
$result['mysqli_available'] = extension_loaded('mysqli');

// Check curl
$result['curl_available'] = extension_loaded('curl');

// Try DB connection with production credentials
$conn = @new mysqli('localhost', 'worlvjwl_camemark_dbuser', 'camemark_dbuser$1', 'worlvjwl_camemark_db');
if ($conn->connect_error) {
    $result['db_status'] = 'FAILED: ' . $conn->connect_error;
} else {
    $result['db_status'] = 'CONNECTED';
    $conn->set_charset('utf8mb4');

    // Check table exists
    $t = $conn->query("SHOW TABLES LIKE 'forum_registrations'");
    $result['forum_table_exists'] = ($t && $t->num_rows > 0) ? 'YES' : 'NO';

    // If exists, get columns
    if ($t && $t->num_rows > 0) {
        $cols = $conn->query("DESCRIBE forum_registrations");
        $colNames = [];
        while ($row = $cols->fetch_assoc()) $colNames[] = $row['Field'];
        $result['forum_columns'] = $colNames;

        // Test insert
        $id = 'dbg-' . time();
        $ok = $conn->query("INSERT INTO forum_registrations (id, name, email, phone, category, payment_status, amount_paid) VALUES ('$id','Debug','d@d.com','670000000','Standard','pending','30,000 XAF')");
        $result['test_insert'] = $ok ? 'SUCCESS' : ('FAILED: ' . $conn->error);
        if ($ok) $conn->query("DELETE FROM forum_registrations WHERE id='$id'");
    }

    $conn->close();
}

// Check if config.php has issues
$configPath = __DIR__ . '/config.php';
$result['config_exists'] = file_exists($configPath) ? 'YES' : 'NO';
$result['config_size'] = file_exists($configPath) ? filesize($configPath) . ' bytes' : 'N/A';

echo json_encode($result, JSON_PRETTY_PRINT);
?>
