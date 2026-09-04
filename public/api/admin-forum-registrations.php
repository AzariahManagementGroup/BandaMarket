<?php
require_once __DIR__ . '/config.php';

// Verify Auth Token
$user = authenticate_request();

if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->prepare("SELECT * FROM forum_registrations ORDER BY registered_at DESC");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
            exit();
        }
        $stmt->execute();
        $registrations = fetch_assoc_stmt($stmt);
        $stmt->close();

        echo json_encode([
            "success" => true,
            "registrations" => $registrations
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    }
    exit();
}
