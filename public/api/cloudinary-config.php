<?php
require_once __DIR__ . '/config.php';

$auth = authenticate_request();
if (!$auth || !isset($auth['role']) || ($auth['role'] !== 'super_admin' && $auth['role'] !== 'admin')) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized access. Admins only."]);
    exit();
}

if ($request_method === 'GET') {
    $res = $conn->query("SELECT cloudName, apiKey, apiSecret FROM cloudinary_settings ORDER BY id DESC LIMIT 1");
    if ($res && $row = $res->fetch_assoc()) {
        echo json_encode(["success" => true, "config" => [
            "cloudName" => $row['cloudName'],
            "apiKey" => $row['apiKey'],
            // Obfuscate secret for frontend retrieval
            "apiSecret" => str_repeat('*', strlen($row['apiSecret']) - 4) . substr($row['apiSecret'], -4)
        ]]);
    } else {
        echo json_encode(["success" => true, "config" => null]);
    }
    exit();
}

if ($request_method === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $cloudName = isset($data['cloudName']) ? trim($data['cloudName']) : '';
    $apiKey = isset($data['apiKey']) ? trim($data['apiKey']) : '';
    $apiSecret = isset($data['apiSecret']) ? trim($data['apiSecret']) : '';

    if (empty($cloudName) || empty($apiKey)) {
        http_response_code(400);
        echo json_encode(["error" => "Cloud Name and API Key are required."]);
        exit();
    }

    $now = date('Y-m-d H:i:s');
    
    // Check if modifying or inserting new
    $res = $conn->query("SELECT * FROM cloudinary_settings ORDER BY id DESC LIMIT 1");
    if ($res && $row = $res->fetch_assoc()) {
        $id = $row['id'];
        
        // If apiSecret is empty or obfuscated, keep the old one
        if (empty($apiSecret) || strpos($apiSecret, '***') !== false) {
            $apiSecret = $row['apiSecret'];
        }

        $stmt = $conn->prepare("UPDATE cloudinary_settings SET cloudName=?, apiKey=?, apiSecret=?, updatedAt=? WHERE id=?");
        $stmt->bind_param("ssssi", $cloudName, $apiKey, $apiSecret, $now, $id);
        $stmt->execute();
    } else {
        if (empty($apiSecret) || strpos($apiSecret, '***') !== false) {
            http_response_code(400);
            echo json_encode(["error" => "API Secret is required for initial setup."]);
            exit();
        }
        $stmt = $conn->prepare("INSERT INTO cloudinary_settings (cloudName, apiKey, apiSecret, updatedAt) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $cloudName, $apiKey, $apiSecret, $now);
        $stmt->execute();
    }

    echo json_encode(["success" => true, "message" => "Cloudinary configuration saved successfully!"]);
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
