<?php
require_once 'config.php';
require_once 'debug.php'; // Includes CORS headers if necessary

// Ensure only GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

$transactions = [];
$sql = "SELECT t.*, u.fullName, u.email FROM transactions t JOIN users u ON t.userId = u.id ORDER BY t.createdAt DESC";
$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['amount'] = abs((float)$row['amount']);
        $row['description'] = $row['merchant'];
        $transactions[] = $row;
    }
}

echo json_encode([
    "success" => true,
    "transactions" => $transactions
]);

$conn->close();
?>
