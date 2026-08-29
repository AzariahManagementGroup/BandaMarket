<?php
require_once __DIR__ . '/config.php';

// Verify Auth Token
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!$authHeader || strpos($authHeader, 'Bearer ') !== 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM forum_registrations ORDER BY createdAt DESC");
    $stmt->execute();
    $registrations = fetch_assoc_stmt($stmt);
    $stmt->close();

    echo json_encode([
        "success" => true,
        "registrations" => $registrations
    ]);
    exit();
}
