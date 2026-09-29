<?php
require_once __DIR__ . '/config.php';

// Allow GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $bannerData = [
        "enabled" => 0,
        "imageUrl" => "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        "title" => "Cameroon E-Commerce Forum 2026",
        "linkUrl" => "/#forum-2026"
    ];

    try {
        $stmt = $conn->prepare("SELECT setting_value FROM referral_settings WHERE setting_key = 'popup_banner_settings'");
        if ($stmt) {
            $stmt->execute();
            $res = $stmt->get_result();
            if ($row = $res->fetch_assoc()) {
                $dbSettings = json_decode($row['setting_value'], true);
                if (is_array($dbSettings)) {
                    $bannerData = array_merge($bannerData, $dbSettings);
                }
            }
            $stmt->close();
        }
    } catch (Exception $e) {}

    echo json_encode([
        "success" => true,
        "banner" => $bannerData
    ]);
    exit();
}

// Allow POST requests (Admin)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $auth = authenticate_request();
    if (!$auth || !isset($auth['role']) || $auth['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Forbidden: Admins only"]);
        exit();
    }

    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if ($input) {
        $enabled = isset($input['enabled']) ? (int)$input['enabled'] : 0;
        $imageUrl = isset($input['imageUrl']) ? $input['imageUrl'] : '';
        $title = isset($input['title']) ? $input['title'] : '';
        $linkUrl = isset($input['linkUrl']) ? $input['linkUrl'] : '';

        $bannerData = json_encode([
            "enabled" => $enabled,
            "imageUrl" => $imageUrl,
            "title" => $title,
            "linkUrl" => $linkUrl
        ]);

        try {
            $stmt = $conn->prepare("INSERT INTO referral_settings (setting_key, setting_value) VALUES ('popup_banner_settings', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
            if ($stmt) {
                $stmt->bind_param("s", $bannerData);
                $stmt->execute();
                $stmt->close();
                echo json_encode(["success" => true, "message" => "Banner updated"]);
                exit();
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Internal server error"]);
            exit();
        }
    }
}

