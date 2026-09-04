<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT setting_value FROM referral_settings WHERE setting_key = 'maintenance_mode'");
    if (!$stmt) {
        echo json_encode(["enabled" => false]);
        exit();
    }
    $stmt->execute();
    $stmt->bind_result($val);
    $enabled = false;
    if ($stmt->fetch()) {
        $enabled = ($val === 'true');
    }
    $stmt->close();
    
    echo json_encode(["enabled" => $enabled]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = authenticate_request();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }
    
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    $enabled = isset($data['enabled']) && $data['enabled'] ? 'true' : 'false';
    
    // Check if exists
    $stmt = $conn->prepare("SELECT id FROM referral_settings WHERE setting_key = 'maintenance_mode'");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $conn->error]);
        exit();
    }
    $stmt->execute();
    $stmt->store_result();
    $exists = $stmt->num_rows > 0;
    $stmt->close();
    
    if ($exists) {
        $stmt = $conn->prepare("UPDATE referral_settings SET setting_value = ? WHERE setting_key = 'maintenance_mode'");
        $stmt->bind_param("s", $enabled);
    } else {
        $id = generate_uuid();
        $key = 'maintenance_mode';
        $stmt = $conn->prepare("INSERT INTO referral_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
        $stmt->bind_param("sss", $id, $key, $enabled);
    }
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $conn->error]);
    }
    $stmt->close();
    exit();
}
