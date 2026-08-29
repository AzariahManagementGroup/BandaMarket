<?php
require_once __DIR__ . '/config.php';

$auth = authenticate_request();
if (!$auth || ($auth['role'] !== 'super_admin' && $auth['role'] !== 'admin')) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized access. Admins only."]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT id, email, ipAddress, location, status, createdAt FROM login_logs ORDER BY createdAt DESC LIMIT 200");
    $stmt->execute();
    $logs = fetch_assoc_stmt($stmt);
    $stmt->close();
    
    echo json_encode($logs);
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
