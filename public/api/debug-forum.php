<?php
// TEMPORARY DEBUG FILE - DELETE AFTER USE
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/config.php';

$errors = [];

// Check DB connection
if (!$conn || $conn->connect_error) {
    $errors[] = "DB connection failed: " . ($conn ? $conn->connect_error : "null");
}

// Check if forum_registrations table exists
$tableCheck = @$conn->query("SHOW TABLES LIKE 'forum_registrations'");
$tableExists = $tableCheck && $tableCheck->num_rows > 0;
$errors[] = "forum_registrations table exists: " . ($tableExists ? "YES" : "NO");

// Check columns in the table
if ($tableExists) {
    $cols = @$conn->query("DESCRIBE forum_registrations");
    $colNames = [];
    if ($cols) {
        while ($row = $cols->fetch_assoc()) {
            $colNames[] = $row['Field'];
        }
    }
    $errors[] = "Columns: " . implode(", ", $colNames);
}

// Try a test insert
$testId = "debug-test-" . time();
$stmt = @$conn->prepare("INSERT INTO forum_registrations (id, name, email, phone, organization, address, city, country, postalCode, category, payment_status, amount_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    $errors[] = "Prepare failed: " . $conn->error;
} else {
    $name = "Debug Test"; $email = "debug@test.com"; $phone = "670000000";
    $org = "Test"; $addr = "123 St"; $city = "Yaounde"; $country = "CM";
    $postal = "12345"; $cat = "Standard (30,000 CFA)"; $ps = "pending"; $amt = "30,000 XAF";
    $stmt->bind_param("ssssssssssss", $testId, $name, $email, $phone, $org, $addr, $city, $country, $postal, $cat, $ps, $amt);
    if ($stmt->execute()) {
        $errors[] = "Test insert: SUCCESS";
        // Clean up
        @$conn->query("DELETE FROM forum_registrations WHERE id = '$testId'");
    } else {
        $errors[] = "Test insert failed: " . $stmt->error;
    }
    $stmt->close();
}

echo json_encode(["debug" => $errors, "db_error" => $conn ? $conn->error : "no connection"]);
?>
