<?php
require_once __DIR__ . '/config.php';

$auth = authenticate_request();

if (!$auth || !isset($auth['role']) || ($auth['role'] !== 'super_admin' && $auth['role'] !== 'admin')) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized access. Admins only."]);
    exit();
}

if ($request_method === 'GET') {
    $logs = [];
    $stmt = $conn->prepare("SELECT * FROM admin_activity_logs ORDER BY createdAt DESC LIMIT 100");
    $stmt->execute();
    $res = $stmt->get_result();

    while ($row = $res->fetch_assoc()) {
        $logs[] = $row;
    }
    
    echo json_encode(["success" => true, "logs" => $logs]);
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
